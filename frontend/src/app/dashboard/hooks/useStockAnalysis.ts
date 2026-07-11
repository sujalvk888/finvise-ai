import { useState, useCallback, useEffect } from 'react';
import { stockService } from '../services/stockService';
import { StockData } from '../types/stock';
import { dashboardStorage } from '../services/dashboardStorage';
import { useDashboardContext } from '../context/DashboardContext';

interface UseStockAnalysisReturn {
  analyze: (ticker: string, isRefresh?: boolean) => Promise<void>;
  data: StockData | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

const STORAGE_KEY = 'finvise_dashboard_data';

export function useStockAnalysis(): UseStockAnalysisReturn {
  const { setActiveStockData, setCachedAnalysis, setIsRefreshingFlag } = useDashboardContext();
  
  const [data, setData] = useState<StockData | null>(() => {
    try {
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Keep context activeStockData in sync with local data
    setActiveStockData(data);
  }, [data, setActiveStockData]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setActiveStockData(null);
    setCachedAnalysis(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [setActiveStockData, setCachedAnalysis]);

  const analyze = useCallback(async (ticker: string, isRefresh?: boolean) => {
    const trimmed = ticker.trim();
    if (!trimmed) {
      setError('Please enter a stock ticker.');
      return;
    }

    setLoading(true);
    setError(null);

    // If it's a refresh, we remove the existing analysis from storage
    if (isRefresh) {
      setIsRefreshingFlag(true);
      dashboardStorage.remove(trimmed);
      setCachedAnalysis(null);
      // Clear sessionStorage so children components also fetch fresh data
      try {
        sessionStorage.removeItem(`finvise_ai_report_${trimmed}_groq`);
        sessionStorage.removeItem(`finvise_ai_report_${trimmed}_ollama`);
        sessionStorage.removeItem(`finvise_chart_data_${trimmed}_1W`);
        sessionStorage.removeItem(`finvise_chart_data_${trimmed}_1M`);
        sessionStorage.removeItem(`finvise_chart_data_${trimmed}_3M`);
        sessionStorage.removeItem(`finvise_chart_data_${trimmed}_6M`);
        sessionStorage.removeItem(`finvise_chart_data_${trimmed}_1Y`);
        sessionStorage.removeItem(`finvise_chart_data_${trimmed}_5Y`);
      } catch {}
    } else {
      // Check cache first
      const cached = dashboardStorage.get(trimmed);
      if (cached) {
        setCachedAnalysis(cached);
        setData(cached.stockData);
        setLoading(false);
        return; // Skip fetch!
      } else {
        setCachedAnalysis(null);
      }
    }

    try {
      const result = await stockService.analyzeStock(trimmed);
      setData(result);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      } catch {}
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
      setIsRefreshingFlag(false);
    }
  }, [setCachedAnalysis, setIsRefreshingFlag]);

  return { analyze, data, loading, error, reset };
}
