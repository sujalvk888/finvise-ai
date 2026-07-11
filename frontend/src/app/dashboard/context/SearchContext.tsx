'use client';

/**
 * SearchContext — bridges the Header (rendered in DashboardLayout)
 * with the page (which owns the stock analysis state).
 * 
 * DashboardLayout renders <Header> and passes context props down.
 * page.tsx consumes the context to drive analysis and display results.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SearchContextValue {
  ticker: string;
  setTicker: (value: string) => void;
  onAnalyze: (isRefresh?: boolean) => void;
  registerAnalyzeCallback: (fn: (isRefresh?: boolean) => void) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

const STORAGE_KEY = 'finvise_dashboard_ticker';

export function SearchProvider({ children }: { children: ReactNode }) {
  const [ticker, setTickerState] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
      return stored || '';
    } catch { return ''; }
  });
  const [loading, setLoading] = useState(false);
  const [analyzeCallback, setAnalyzeCallback] = useState<((isRefresh?: boolean) => void) | null>(null);

  const setTicker = useCallback((val: string) => {
    setTickerState(val);
    try {
      if (val) {
        sessionStorage.setItem(STORAGE_KEY, val);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, []);

  const registerAnalyzeCallback = useCallback((fn: (isRefresh?: boolean) => void) => {
    setAnalyzeCallback(() => fn);
  }, []);

  const onAnalyze = useCallback((isRefresh?: boolean) => {
    if (analyzeCallback) analyzeCallback(isRefresh);
  }, [analyzeCallback]);

  return (
    <SearchContext.Provider value={{ ticker, setTicker, onAnalyze, registerAnalyzeCallback, loading, setLoading }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used inside <SearchProvider>');
  return ctx;
}
