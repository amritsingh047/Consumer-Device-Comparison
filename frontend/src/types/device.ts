export type DeviceCategory = 'MOBILE' | 'LAPTOP' | 'TABLET' | 'AUDIO' | 'WATCH';

export interface PriceEntry {
  id: string; deviceId: string; vendor: string;
  priceInr: number; affiliateUrl: string; scrapedAt: string; inStock: boolean;
}

export interface VideoEntry {
  id: string; deviceId: string; title: string; channelName: string; publishedAt: string;
}

export interface DeviceSpecs {
  display?: { size?: string; resolution?: string; technology?: string; refreshRate?: string; brightness?: string; hdr?: string; };
  performance?: { chipset?: string; cpu?: string; gpu?: string; ram?: string; storage?: string; benchmark?: string; };
  battery?: { capacity?: string; charging?: string; wirelessCharging?: string; batteryLife?: string; };
  camera?: { mainSensor?: string; ultrawide?: string; telephoto?: string; frontCamera?: string; videoCapture?: string; };
  connectivity?: { wifi?: string; bluetooth?: string; nfc?: string; usb?: string; cellular?: string; };
  design?: { dimensions?: string; weight?: string; material?: string; waterResistance?: string; colors?: string; };
  audio?: { speakers?: string; noiseCancellation?: string; codecs?: string; driverSize?: string; frequencyResponse?: string; impedance?: string; };
  software?: { os?: string; uiLayer?: string; updates?: string; };
}

export interface Device {
  id: string; name: string; brand: string; category: DeviceCategory;
  releaseDate: string; imageUrl: string; thumbnailUrl: string; tagline: string;
  specs: DeviceSpecs; prices: PriceEntry[]; videos: VideoEntry[];
  tags: string[];
}

export interface SearchResult {
  id: string; name: string; brand: string; category: DeviceCategory;
  thumbnailUrl: string; releaseDate: string; lowestInr?: number;
  tags: string[];
}
