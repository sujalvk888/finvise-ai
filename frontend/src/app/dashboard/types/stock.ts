// TypeScript types for stock data — mirrors backend StockDataResponse schema

export interface StockData {
  // Company Identity
  company_name: string | null;
  symbol: string;
  currency: string;
  exchange: string | null;
  industry: string | null;
  sector: string | null;
  country: string | null;
  website: string | null;
  business_summary: string | null;
  logo_url: string | null;
  last_updated_time: string | null;

  // Pricing (All in INR)
  current_price: number | null;
  previous_close: number | null;
  open_price: number | null;
  day_high: number | null;
  day_low: number | null;
  market_state: string | null;

  // 52-week (All in INR)
  week_52_high: number | null;
  week_52_low: number | null;

  // Fundamentals (Monetary values in INR)
  market_cap: number | null;
  volume: number | null;
  average_volume: number | null;
  dividend_yield: number | null;
  beta: number | null;
  pe_ratio: number | null;
  eps: number | null;
  debt_to_equity: number | null;
  gross_margin: number | null;
  validation_flags?: {
    pe_invalid_negative_eps?: boolean;
    gross_margin_invalid?: boolean;
  };
}

export interface StockError {
  detail: string;
}

export interface HistoricalDataPoint {
  date: string;
  close: number;
}

export interface HistoricalDataResponse {
  ticker: string;
  time_range: string;
  data: HistoricalDataPoint[];
}

export interface AiReport {
  engine: string;
  company_summary: string;
  strengths: string[];
  risks: string[];
  verdict_label: string;
  verdict_text: string;
}

