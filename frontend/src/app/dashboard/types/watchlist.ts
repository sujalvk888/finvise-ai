export interface WatchlistStock {
  id: number;
  company: string;
  sector: string;
  symbol: string;
  currency?: string;
  price: string;
  change: string;
  changePercent: string;
  marketCap: string;
  aiVerdict: string;
  aiEngine?: string;
  aiGeneratedTime?: string;
  marketStatus: string;
  addedTime: string;
  lastUpdated: string;
  logoUrl?: string;
}
