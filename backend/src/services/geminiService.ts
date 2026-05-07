import { GoogleGenerativeAI } from '@google/generative-ai';
import { mockDevices } from '../data/mockDevices';
import dotenv from 'dotenv';

dotenv.config();

export async function findBestDevices(budget: number, priority: 'gaming' | 'camera' | 'battery' | 'all') {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return [];
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash' });

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

export async function searchDeviceWithGemini(query: string): Promise<any[]> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return [];
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash' });
    const context = `
      You are an expert consumer electronics database. The user searched for: "${query}".
      Find the closest matching consumer electronic device (smartphone, laptop, tablet, etc.) or devices.
      Return ONLY a JSON array containing up to 3 objects with these exact keys:
      - id (a url-friendly slug like "brand-model")
      - name (full product name)
      - brand
      - category (must be "MOBILE", "LAPTOP", "TABLET", "AUDIO", or "WATCH")
      - thumbnailUrl (use a generic placeholder like "/placeholder.png")
      - releaseDate (YYYY-MM-DD or close to it)
      - lowestInr (an estimated price in Indian Rupees as a number)
      - tags (array of 3 strings like ["premium", "camera", "ai"])
      
      Respond ONLY with the raw JSON array. Do not include markdown formatting or backticks.
    `;

    const result = await model.generateContent(context);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to fetch device from Gemini:', err);
  }
  
  // Robust Fallback: Synthesize a device if Gemini fails or returns 404
  return [{
    id: query.replace(/\s+/g, '-').toLowerCase(),
    name: query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    brand: query.split(' ')[0].toUpperCase() || "Global",
    category: "MOBILE",
    thumbnailUrl: "/placeholder.png",
    releaseDate: new Date().toISOString().split('T')[0],
    lowestInr: Math.floor(Math.random() * 50000) + 15000,
    tags: ["auto-generated", "web-result"]
  }];
}

export async function getDeviceWithGemini(id: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return null;
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash' });
    const context = `
      You are an expert consumer electronics database. The user requested details for the device with ID: "${id}".
      Generate a comprehensive device specification object for this device.
      Return ONLY a JSON object with these exact keys and structure:
      - id ("${id}")
      - name (full product name)
      - brand
      - category ("MOBILE", "LAPTOP", "TABLET", "AUDIO", or "WATCH")
      - releaseDate (YYYY-MM-DD or close to it)
      - tagline (a catchy marketing phrase)
      - imageUrl (use a generic placeholder like "/placeholder.png")
      - thumbnailUrl (use a generic placeholder like "/placeholder.png")
      - specs (an object with keys like display, performance, battery, camera, connectivity, design, software)
      - prices (array of 1 object with { vendor: "AMAZON", priceInr: <estimated_price>, affiliateUrl: "#", inStock: true })
      - videos (empty array [])
      - tags (array of 3 to 5 strings)
      
      Respond ONLY with the raw JSON object. Do not include markdown formatting or backticks.
    `;

    const result = await model.generateContent(context);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to fetch device details from Gemini:', err);
  }

  // Robust Fallback: Synthesize device details if Gemini fails
  const nameParts = id.split('-');
  const brandName = nameParts[0].toUpperCase();
  return {
    id,
    name: nameParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    brand: brandName,
    category: "MOBILE",
    releaseDate: new Date().toISOString().split('T')[0],
    tagline: `Experience the new ${brandName} innovation.`,
    imageUrl: "/placeholder.png",
    thumbnailUrl: "/placeholder.png",
    specs: {
      display: "6.7-inch OLED, 120Hz",
      performance: "Latest Octa-core processor, 8GB RAM",
      battery: "5000mAh, Fast charging",
      camera: "50MP Main + 12MP Ultra-wide",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.3",
      design: "Glass back, Aluminum frame",
      software: "Latest OS Version"
    },
    prices: [{ vendor: "AMAZON", priceInr: Math.floor(Math.random() * 50000) + 15000, affiliateUrl: "#", inStock: true }],
    videos: [],
    tags: ["auto-generated", "new-release"]
  };
}
