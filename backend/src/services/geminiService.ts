import { GoogleGenerativeAI } from '@google/generative-ai';
import { mockDevices } from '../data/mockDevices';
import dotenv from 'dotenv';

dotenv.config();

export async function findBestDevices(budget: number, priority: 'gaming' | 'camera' | 'battery' | 'all') {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return [];
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const context = `
    I have a database of electronics. Featured devices:
    ${mockDevices.slice(0, 50).map(d => `- ${d.name} (Brand: ${d.brand}, Category: ${d.category}, Tags: ${d.tags.join(', ')}) Price ~₹${d.prices[0]?.priceInr || 'N/A'}`).join('\n')}
    ... and 250+ more devices including budget laptops and smartphones.

    User Request:
    - Budget: ₹${budget}
    - Priority: ${priority}
    
    Tasks:
    1. Select the top 3 best devices for this user.
    2. Priority 1: Match from the list above if they fit the budget and priority.
    3. Priority 2: If the list lacks suitable options, recommend global 2026 models.
    4. Return ONLY a JSON array of objects with keys: name, reason, score (1-10), matchingId (the exact ID if it matches our list, else null).
    IMPORTANT: Respond ONLY with the JSON array.
  `;

  try {
    const result = await model.generateContent(context);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response: remove markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Extract array if it's buried in text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if no array found but text is valid JSON
    try {
      return JSON.parse(text);
    } catch {
      console.warn('Gemini returned non-JSON text:', text);
      return [];
    }
  } catch (error) {
    console.error('Gemini Error or 404, falling back to local search...', error);
    // Fallback logic
    const matched = mockDevices.filter(d => {
      const price = d.prices[0]?.priceInr || 999999;
      return price <= budget;
    });
    
    // Sort by priority if possible, otherwise by price descending to get the best in budget
    matched.sort((a, b) => (b.prices[0]?.priceInr || 0) - (a.prices[0]?.priceInr || 0));
    
    return matched.slice(0, 3).map((d, index) => ({
      name: d.name,
      reason: `Based on your budget of ₹${budget}, this is an excellent choice from our database.`,
      score: 9 - index,
      matchingId: d.id
    }));
  }
}

export async function searchDeviceWithGemini(query: string) {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return [];

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const context = `
    The user is searching for an electronic device using the query: "${query}".
    This could be a device name, a brand, or an e-commerce URL.
    
    Task: Identify the main electronic device(s) the user is looking for and return a JSON array containing up to 3 matching devices.
    
    Each object in the array MUST have exactly these keys:
    - id: A URL-friendly slugified version of the device name (e.g., "iphone-15-pro")
    - name: Full name of the device
    - brand: Brand name
    - category: Must be one of "MOBILE", "LAPTOP", "TABLET", "AUDIO", or "WATCH"
    - thumbnailUrl: A URL for the device image. Use this exact format: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80" (or similar unsplash electronics placeholders)
    - releaseDate: Estimated release date (YYYY-MM-DD)
    - lowestInr: Estimated price in Indian Rupees (number, e.g., 80000)
    - tags: Array of 2-3 descriptive tags (e.g., ["flagship", "camera"])

    IMPORTANT: Respond ONLY with the JSON array. Do not include markdown blocks or any other text.
  `;

  try {
    const result = await model.generateContent(context);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Search Error:', error);
    return [];
  }
}
