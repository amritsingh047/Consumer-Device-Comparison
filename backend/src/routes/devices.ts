import { Router, Request, Response } from 'express';
import { mockDevices } from '../data/mockDevices';
import { extractProductIdentifier } from '../services/urlExtractionService';
import { Device, SearchResult } from '../types/device';
import { getYouTubeReviews } from '../services/youtubeService';
import { searchDeviceWithGemini, getDeviceWithGemini } from '../services/geminiService';

const router = Router();

// Device reviews endpoint
router.get('/:id/reviews', async (req: Request, res: Response) => {
  const device = mockDevices.find(d => d.id === req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  
  const reviews = await getYouTubeReviews(device.name);
  res.json(reviews);
});

// Search endpoint
router.get('/search', async (req: Request, res: Response) => {
  let query = (req.query.q as string || '').toLowerCase().trim();
  // Strip quotes if present
  query = query.replace(/^["']|["']$/g, '');
  if (!query) return res.json([]);

  const extracted = extractProductIdentifier(query);
  let results: SearchResult[];

  console.log(`Search query: "${query}", Extracted:`, extracted);

  if (extracted.retailer !== 'UNSUPPORTED' && extracted.productId) {
    // URL-based lookup returns all devices (demo purposes)
    results = mockDevices.slice(0, 5).map(toSearchResult);
  } else {
    results = mockDevices
      .filter(d => {
        try {
          return (
            (d.name?.toLowerCase().includes(query)) ||
            (d.brand?.toLowerCase().includes(query)) ||
            (d.category?.toLowerCase().includes(query)) ||
            (d.tags?.some(t => t.toLowerCase().includes(query)))
          );
        } catch (e) {
          return false;
        }
      })
      .slice(0, 24)
      .map(toSearchResult);
      
    // AI FALLBACK: If not found in local mock database, search using Gemini AI
    if (results.length === 0) {
      console.log(`No local results for "${query}". Falling back to Gemini AI...`);
      const aiResults = await searchDeviceWithGemini(query);
      if (aiResults && aiResults.length > 0) {
        results = aiResults.map(toSearchResult);
      }
    }
  }
  
  console.log(`Found ${results.length} results`);
  res.json(results);
});

// Device detail endpoint
router.get('/:id', async (req: Request, res: Response) => {
  let device = mockDevices.find(d => d.id === req.params.id);
  
  if (!device) {
    console.log(`Device ID "${req.params.id}" not found locally. Fetching from Gemini AI...`);
    const aiDevice = await getDeviceWithGemini(req.params.id);
    if (aiDevice) {
      device = aiDevice;
    } else {
      return res.status(404).json({ error: 'Device not found', message: 'This device is not in our database yet. Submit a request to add it.' });
    }
  }
  res.json(device);
});

// All devices
router.get('/', (_req: Request, res: Response) => {
  res.json(mockDevices.map(toSearchResult));
});

function toSearchResult(d: Device): SearchResult {
  try {
    const prices = d.prices || [];
    const validPrices = prices.filter(p => typeof p.priceInr === 'number' && !isNaN(p.priceInr));
    const lowestInr = validPrices.length > 0 ? Math.min(...validPrices.map(p => p.priceInr)) : undefined;
    
    return {
      id: d.id || 'unknown',
      name: d.name || 'Unknown Device',
      brand: d.brand || 'Unknown',
      category: d.category || 'MOBILE' as any,
      thumbnailUrl: d.thumbnailUrl || '/placeholder.png',
      releaseDate: d.releaseDate || '',
      lowestInr,
      tags: Array.isArray(d.tags) ? d.tags : []
    };
  } catch (e) {
    console.error(`Error mapping device ${d?.id} to search result:`, e);
    // Return a minimal valid result instead of crashing
    return {
      id: d?.id || 'error',
      name: d?.name || 'Error Loading Device',
      brand: 'Error',
      category: 'MOBILE' as any,
      thumbnailUrl: '/placeholder.png',
      releaseDate: '',
      tags: []
    };
  }
}

export default router;
