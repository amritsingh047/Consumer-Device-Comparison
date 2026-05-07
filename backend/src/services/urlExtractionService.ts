import { ExtractedProduct } from '../types/device';

export function extractProductIdentifier(input: string): ExtractedProduct {
  const amazonRegex = /(?:\/dp\/|\/product\/|\/exec\/obidos\/ASIN\/)([A-Z0-9]{10})/;
  const amazonMatch = input.match(amazonRegex);
  if (amazonMatch && amazonMatch[1]) {
    return { retailer: 'AMAZON', productId: amazonMatch[1] };
  }
  const bestBuyRegex = /(?:skuId=|id=)(\d+)/;
  const bestBuyMatch = input.match(bestBuyRegex);
  if (bestBuyMatch && bestBuyMatch[1]) {
    return { retailer: 'BESTBUY', productId: bestBuyMatch[1] };
  }
  return { retailer: 'UNSUPPORTED', productId: null };
}
