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
    console.error('Gemini Error:', error);
    return [];
  }
}
