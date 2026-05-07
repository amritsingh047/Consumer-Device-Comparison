import { Router, Request, Response } from 'express';
import { mockDevices } from '../data/mockDevices';
import { extractProductIdentifier } from '../services/urlExtractionService';
import { Device, SearchResult } from '../types/device';
import { getYouTubeReviews } from '../services/youtubeService';

const router = Router();

// Device reviews endpoint
router.get('/:id/reviews', async (req: Request, res: Response) => {
  const device = mockDevices.find(d => d.id === req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  
  const reviews = await getYouTubeReviews(device.name);
  res.json(reviews);
});

import { findBestDevices, searchDeviceWithGemini } from '../services/geminiService';

// Search endpoint
router.get('/search', async (req: Request, res: Response) => {
  let query = (req.query.q as string || '').toLowerCase().trim();
  // Strip quotes if present
  query = query.replace(/^["']|["']$/g, '');
  if (!query) return res.json([]);

  const extracted = extractProductIdentifier(query);
  let results: SearchResult[] = [];

  console.log(`Search query: "${query}", Extracted:`, extracted);

  if (extracted.retailer === 'UNSUPPORTED' || !extracted.productId) {
    // Normal search locally
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
          console.error(`Error filtering device ${d.id}:`, e);
          return false;
        }
      })
      .slice(0, 24)
      .map(toSearchResult);
  }

  // If no local results found, or if it's a direct URL query from Amazon/BestBuy, use Gemini to fetch from web
  if (results.length === 0 || extracted.retailer !== 'UNSUPPORTED') {
    console.log(`No local results or URL provided. Asking Gemini for "${query}"...`);
    const geminiResults = await searchDeviceWithGemini(query);
    if (geminiResults && geminiResults.length > 0) {
      results = geminiResults;
      
      // Optionally add them to mockDevices cache so /devices/:id works later
      // We need to map SearchResult -> Device to push to mockDevices, 
      // but for now the user just wants the search bar to show results.
      // The search bar navigates to /device/:id, so we MUST cache it as a full device!
      geminiResults.forEach((r: SearchResult) => {
        if (!mockDevices.find(d => d.id === r.id)) {
          mockDevices.push({
            id: r.id,
            name: r.name,
            brand: r.brand,
            category: r.category,
            releaseDate: r.releaseDate || '2025-01-01',
            tagline: 'AI Discovered Device',
            imageUrl: r.thumbnailUrl,
            thumbnailUrl: r.thumbnailUrl,
            specs: {
              performance: { cpu: 'AI Discovered', ram: 'Unknown', storage: 'Unknown' }
            },
            prices: r.lowestInr ? [{ id: 'p-' + r.id, deviceId: r.id, vendor: 'AMAZON', priceInr: r.lowestInr, affiliateUrl: '#', scrapedAt: new Date().toISOString(), inStock: true }] : [],
            videos: [],
            tags: r.tags || []
          });
        }
      });
    }
  }
  
  console.log(`Found ${results.length} results`);
  res.json(results);
});

// Device detail endpoint
router.get('/:id', (req: Request, res: Response) => {
  const device = mockDevices.find(d => d.id === req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found', message: 'This device is not in our database yet. Submit a request to add it.' });
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
