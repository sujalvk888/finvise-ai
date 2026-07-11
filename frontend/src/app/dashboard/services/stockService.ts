// Dashboard API service — dedicated to stock data requests.
// API logic lives here; components stay clean.

import Cookies from 'js-cookie';
import { StockData, HistoricalDataResponse, AiReport } from '../types/stock';

const _RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const API_URL = _RAW_URL.endsWith('/api') ? _RAW_URL : `${_RAW_URL}/api`;

function getAuthHeaders(): HeadersInit {
  const token = Cookies.get('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const historyCache = new Map<string, Promise<HistoricalDataResponse>>();

export const stockService = {
  async analyzeStock(rawTicker: string): Promise<StockData> {
    // Trim whitespace and convert to uppercase — requirement from spec
    const ticker = rawTicker.trim().toUpperCase();

    if (!ticker) {
      throw new Error('Please enter a stock ticker.');
    }

    const res = await fetch(`${API_URL}/dashboard/stock`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ticker }),
    });

    if (!res.ok) {
      // Parse backend error message and surface it in a friendly way
      let message = 'Something went wrong. Please try again.';
      try {
        const err = await res.json();
        if (err?.detail) message = err.detail;
      } catch {
        // fallback message used
      }
      throw new Error(message);
    }

    return res.json() as Promise<StockData>;
  },
  
  async getHistoricalData(ticker: string, range: string): Promise<HistoricalDataResponse> {
    const cacheKey = `${ticker.toUpperCase()}-${range}`;
    if (historyCache.has(cacheKey)) {
      return historyCache.get(cacheKey)!;
    }

    const promise = (async () => {
      const res = await fetch(`${API_URL}/dashboard/history?ticker=${encodeURIComponent(ticker)}&range=${encodeURIComponent(range)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        historyCache.delete(cacheKey); // Remove failed requests from cache
        let message = 'Historical price data is currently unavailable.';
        try {
          const err = await res.json();
          if (err?.detail) message = err.detail;
        } catch {
          // fallback
        }
        throw new Error(message);
      }
      
      return res.json();
    })();

    historyCache.set(cacheKey, promise);
    return promise;
  },

  async getAiAnalysis(ticker: string, engine: string): Promise<AiReport> {
    const res = await fetch(`${API_URL}/dashboard/analyze-ai`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ticker: ticker.trim().toUpperCase(), engine }),
    });

    if (!res.ok) {
      let message = 'Unable to generate AI analysis at this time.';
      try {
        const err = await res.json();
        if (err?.detail) message = err.detail;
      } catch {
        // fallback
      }
      throw new Error(message);
    }

    return res.json() as Promise<AiReport>;
  },

  async getPopularStocks(): Promise<{ symbol: string; name: string; }[]> {
    const res = await fetch(`${API_URL}/dashboard/popular`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      return []; // Fallback to empty array if fail
    }

    return res.json();
  }
};
