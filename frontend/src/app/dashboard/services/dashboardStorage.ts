import { StockData, HistoricalDataPoint, AiReport } from '../types/stock';

export interface SavedAnalysis {
  timestamp: string;
  stockData: StockData;
  aiReport: AiReport;
  historicalData: HistoricalDataPoint[];
  engine: string;
  chartTimeframe: string;
  chartType: string;
}

const BASE_STORAGE_KEY = 'finvise_saved_analyses';

function getStorageKey(): string {
  if (typeof window === 'undefined') return BASE_STORAGE_KEY;
  const userId = localStorage.getItem('finvise_user_id');
  return userId ? `${BASE_STORAGE_KEY}_${userId}` : BASE_STORAGE_KEY;
}

export const dashboardStorage = {
  getAll(): Record<string, SavedAnalysis> {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  get(ticker: string): SavedAnalysis | null {
    if (!ticker) return null;
    const all = this.getAll();
    return all[ticker.toUpperCase()] || null;
  },

  save(ticker: string, analysis: Omit<SavedAnalysis, 'timestamp'>) {
    if (!ticker) return;
    const all = this.getAll();
    const now = new Date();
    
    // Format timestamp: "10 Jul 2026 • 2:35 PM"
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const timestamp = `${formattedDate} • ${formattedTime}`;

    all[ticker.toUpperCase()] = {
      ...analysis,
      timestamp
    };

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(all));
    } catch (e) {
      console.error('Failed to save analysis to localStorage', e);
    }
  },

  remove(ticker: string) {
    if (!ticker) return;
    const all = this.getAll();
    delete all[ticker.toUpperCase()];
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(all));
    } catch (e) {
      console.error('Failed to remove analysis from localStorage', e);
    }
  },
  
  has(ticker: string): boolean {
    return this.get(ticker) !== null;
  }
};
