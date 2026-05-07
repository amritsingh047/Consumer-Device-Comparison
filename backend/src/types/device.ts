export type DeviceCategory = 'MOBILE' | 'LAPTOP' | 'TABLET' | 'AUDIO' | 'WATCH';
export type Retailer = 'AMAZON' | 'BEST_BUY' | 'WALMART' | 'FLIPKART' | 'RELIANCE_DIGITAL';

export interface PriceEntry {
  id: string;
  deviceId: string;
  vendor: 'AMAZON' | 'BEST_BUY' | 'WALMART' | 'FLIPKART' | 'RELIANCE_DIGITAL';
  priceInr: number;
  affiliateUrl: string;
  scrapedAt: string;
  inStock: boolean;
}

export interface VideoEntry {
  id: string;
  deviceId: string;
  title: string;
  channelName: string;
  publishedAt: string;
}

export interface Device {
  id: string;
  name: string;
  brand: string;
  category: DeviceCategory;
  releaseDate: string;
  imageUrl: string;
  thumbnailUrl: string;
  tagline: string;
  specs: DeviceSpecs;
  prices: PriceEntry[];
  videos: VideoEntry[];
  tags: string[];
}

export interface DeviceSpecs {
  display?: DisplaySpecs;
  performance?: PerformanceSpecs;
  battery?: BatterySpecs;
  camera?: CameraSpecs;
  connectivity?: ConnectivitySpecs;
  design?: DesignSpecs;
  audio?: AudioSpecs;
  software?: SoftwareSpecs;
}

export interface DisplaySpecs {
  size?: string;
  resolution?: string;
  technology?: string;
  refreshRate?: string;
  brightness?: string;
  hdr?: string;
}

export interface PerformanceSpecs {
  chipset?: string;
  cpu?: string;
  gpu?: string;
  ram?: string;
  storage?: string;
  benchmark?: string;
}

export interface BatterySpecs {
  capacity?: string;
  charging?: string;
  wirelessCharging?: string;
  batteryLife?: string;
}

export interface CameraSpecs {
  mainSensor?: string;
  ultrawide?: string;
  telephoto?: string;
  frontCamera?: string;
  videoCapture?: string;
}

export interface ConnectivitySpecs {
  wifi?: string;
  bluetooth?: string;
  nfc?: string;
  usb?: string;
  cellular?: string;
}

export interface DesignSpecs {
  dimensions?: string;
  weight?: string;
  material?: string;
  waterResistance?: string;
  colors?: string;
}

export interface AudioSpecs {
  speakers?: string;
  noiseCancellation?: string;
  codecs?: string;
  driverSize?: string;
  frequencyResponse?: string;
  impedance?: string;
}

export interface SoftwareSpecs {
  os?: string;
  uiLayer?: string;
  updates?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  brand: string;
  category: DeviceCategory;
  thumbnailUrl: string;
  releaseDate: string;
  lowestInr?: number;
  tags: string[];
}

export interface ExtractedProduct {
  retailer: 'AMAZON' | 'BESTBUY' | 'UNSUPPORTED';
  productId: string | null;
}
