import { GoogleGenerativeAI } from '@google/generative-ai';
import { mockDevices } from '../data/mockDevices';
import dotenv from 'dotenv';

dotenv.config();

export async function findBestDevices(budget: number, priority: 'gaming' | 'camera' | 'battery' | 'all') {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return [];
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

export async function searchGlobalDevices(query: string) {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return [];
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const context = `
    You are a product expert. A user is searching for "${query}".
    We don't have this device in our local database.
    
    Task:
    1. Identify the specific device the user is searching for.
    2. Provide accurate current specifications and an estimated price in Indian Rupees (INR).
    3. Return ONLY a JSON object representing the device with these keys: 
       id (slugified name), name, brand, category (MOBILE/LAPTOP/AUDIO/WATCH/TABLET), 
       releaseDate, tagline, thumbnailUrl (use a high quality placeholder from unsplash if unknown), 
       lowestInr, tags (array).
    
    IMPORTANT: Respond ONLY with the JSON object.
  `;

  try {
    const result = await model.generateContent(context);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const deviceData = JSON.parse(jsonMatch[jsonMatch.index === undefined ? 0 : jsonMatch.index]);
      return [deviceData];
    }
    return [];
  } catch (error) {
    console.error('Global Search Gemini Error:', error);
    return [];
  }
}
