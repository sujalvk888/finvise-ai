'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { WatchlistStock } from '../types/watchlist';
import { StockData } from '../types/stock';
import { formatCurrency, formatCompactCurrency } from '../utils/currency';

import { stockService } from '../services/stockService';

interface WatchlistContextValue {
  watchlist: WatchlistStock[];
  addStock: (stock: WatchlistStock | StockData, aiVerdict?: string) => void;
  removeStock: (symbol: string) => void;
  isStockInWatchlist: (symbol: string) => boolean;
  refreshPrices: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  refreshStock: (symbol: string) => Promise<void>;
  updateAiVerdict: (symbol: string, verdict: string, engine: string, time: string) => void;
  isRefreshing: boolean;
  clearWatchlist: () => void;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

const BASE_STORAGE_KEY = 'finvise_watchlist_v1';

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  useEffect(() => {
    // Load user and configure storage key
    import('../../../services/auth').then(({ authService }) => {
      authService.getCurrentUser().then((user: { id: string | number } | null) => {
        const key = user ? `${BASE_STORAGE_KEY}_${user.id}` : BASE_STORAGE_KEY;
        setStorageKey(key);
      });
    });
  }, []);

  useEffect(() => {
    if (!storageKey) return;

    const stored = localStorage.getItem(storageKey);
    let initialWatchlist: WatchlistStock[] = [];

    // Only provide default stocks for guests (no user id)
    if (!stored && storageKey === BASE_STORAGE_KEY) {
      initialWatchlist = [
        { id: 1, company: 'Tesla, Inc.', sector: 'Automotive', symbol: 'TSLA', currency: 'USD', price: '$225.27', change: '+$3.22', changePercent: '1.32%', marketCap: '$725.12B', aiVerdict: 'Not Analyzed', marketStatus: 'Market Open', addedTime: '10:45 AM', lastUpdated: '10:45 AM' },
        { id: 2, company: 'Apple Inc.', sector: 'Technology', symbol: 'AAPL', currency: 'USD', price: '$180.82', change: '+$1.92', changePercent: '0.80%', marketCap: '$2.85T', aiVerdict: 'Not Analyzed', marketStatus: 'Market Open', addedTime: '10:45 AM', lastUpdated: '10:45 AM' }
      ];
    } else if (stored) {
      try {
        initialWatchlist = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse watchlist from localStorage', e);
      }
    }
    Promise.resolve().then(() => {
      setWatchlist(initialWatchlist);
      setIsLoaded(true);
    });
  }, [storageKey]);

  useEffect(() => {
    if (isLoaded && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(watchlist));
    }
  }, [watchlist, isLoaded, storageKey]);

  const fetchStockData = async (symbol: string, fetchAi: boolean = false): Promise<Partial<WatchlistStock> | null> => {
    try {
      const sd = await stockService.analyzeStock(symbol);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      
      const changeAmount = (sd.current_price || 0) - (sd.previous_close || 0);
      const changePercent = sd.previous_close ? (changeAmount / sd.previous_close) * 100 : 0;
      
      let aiVerdict: 'Hold' | 'Buy' | 'Sell' | undefined = undefined;
      if (fetchAi) {
        try {
          const aiData = await stockService.getAiAnalysis(symbol, 'groq');
          if (aiData.verdict_label.toLowerCase().includes('buy')) aiVerdict = 'Buy';
          else if (aiData.verdict_label.toLowerCase().includes('sell')) aiVerdict = 'Sell';
          else aiVerdict = 'Hold';
        } catch {
          console.error(`Failed to fetch AI analysis for ${symbol}`);
        }
      }

      const fmtNum = (num: number, prefix: string = '') => `${prefix}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      const partial: Partial<WatchlistStock> = {
        currency: sd.currency,
        price: sd.current_price !== null && sd.current_price !== undefined ? formatCurrency(sd.current_price, sd.currency) : '—',
        change: changeAmount > 0 ? `+${formatCurrency(changeAmount, sd.currency)}` : formatCurrency(changeAmount, sd.currency),
        changePercent: changePercent > 0 ? `+${fmtNum(changePercent)}%` : `${fmtNum(changePercent)}%`,
        marketCap: sd.market_cap ? formatCompactCurrency(sd.market_cap, sd.currency) : 'N/A',
        marketStatus: sd.market_state || 'Unknown',
        lastUpdated: timeStr,
        company: sd.company_name || 'Information unavailable',
        sector: sd.sector || sd.industry || sd.exchange || 'Information unavailable',
        logoUrl: sd.logo_url || undefined
      };
      
      if (aiVerdict) partial.aiVerdict = aiVerdict;
      
      return partial;
    } catch (e) {
      console.error(`Failed to update ${symbol}`, e);
      return null;
    }
  };

  const refreshPrices = async () => {
    if (watchlist.length === 0 || isRefreshing) return;
    setIsRefreshing(true);
    
    try {
      const updates = await Promise.allSettled(
        watchlist.map(s => fetchStockData(s.symbol, false).then(data => ({ symbol: s.symbol, data })))
      );
      
      setWatchlist(prev => prev.map(stock => {
        const updateResult = updates.find(u => u.status === 'fulfilled' && u.value.symbol === stock.symbol);
        if (updateResult && updateResult.status === 'fulfilled' && updateResult.value.data) {
          return { ...stock, ...updateResult.value.data };
        }
        return stock;
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  const forceRefresh = async () => {
    if (watchlist.length === 0 || isRefreshing) return;
    setIsRefreshing(true);
    
    try {
      const updates = await Promise.allSettled(
        watchlist.map(s => fetchStockData(s.symbol, true).then(data => ({ symbol: s.symbol, data })))
      );
      
      setWatchlist(prev => prev.map(stock => {
        const updateResult = updates.find(u => u.status === 'fulfilled' && u.value.symbol === stock.symbol);
        if (updateResult && updateResult.status === 'fulfilled' && updateResult.value.data) {
          return { ...stock, ...updateResult.value.data };
        }
        return stock;
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshStock = async (symbol: string) => {
    setIsRefreshing(true);
    try {
      const updateResult = await fetchStockData(symbol, false);
      if (updateResult) {
        setWatchlist(prev => prev.map(stock => 
          stock.symbol === symbol ? { ...stock, ...updateResult } : stock
        ));
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateAiVerdict = useCallback((symbol: string, verdict: string, engine: string, time: string) => {
    setWatchlist(prev => prev.map(stock => 
      stock.symbol === symbol ? { ...stock, aiVerdict: verdict, aiEngine: engine, aiGeneratedTime: time } : stock
    ));
  }, []);

  // Polling mechanism (60 seconds)
  useEffect(() => {
    if (!isLoaded || watchlist.length === 0) return;
    
    const intervalId = setInterval(() => {
      refreshPrices();
    }, 60000); // 60 seconds
    
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, watchlist.length]);

  const clearWatchlist = () => {
    setWatchlist([]);
  };

  const addStock = (data: WatchlistStock | StockData, aiVerdict?: string) => {
    setWatchlist((prev) => {
      if (prev.some((s) => s.symbol === data.symbol)) {
        return prev;
      }

      let newStock: WatchlistStock;
      if ('price' in data && typeof data.price === 'string' && data.price.startsWith('$')) {
        newStock = data as WatchlistStock;
        if (aiVerdict) {
          newStock.aiVerdict = aiVerdict;
        }
      } else {
        const sd = data as StockData;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        
        const changeAmount = (sd.current_price || 0) - (sd.previous_close || 0);
        const changePercent = sd.previous_close ? (changeAmount / sd.previous_close) * 100 : 0;
        
        const fmtNum = (num: number, prefix: string = '') => `${prefix}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        newStock = {
          id: Date.now(),
          company: sd.company_name || 'Information unavailable',
          sector: sd.sector || sd.industry || sd.exchange || 'Information unavailable',
          symbol: sd.symbol,
          currency: sd.currency,
          price: sd.current_price !== null && sd.current_price !== undefined ? formatCurrency(sd.current_price, sd.currency) : '—',
          change: changeAmount > 0 ? `+${formatCurrency(changeAmount, sd.currency)}` : formatCurrency(changeAmount, sd.currency),
          changePercent: changePercent > 0 ? `+${fmtNum(changePercent)}%` : `${fmtNum(changePercent)}%`,
          marketCap: sd.market_cap ? formatCompactCurrency(sd.market_cap, sd.currency) : 'N/A',
          aiVerdict: aiVerdict || 'Not Analyzed', 
          marketStatus: sd.market_state || 'Unknown',
          addedTime: timeStr,
          lastUpdated: timeStr,
          logoUrl: sd.logo_url || undefined
        };
        
        // Removed initial AI fetch as it should default to 'Not Analyzed'

      }
      return [...prev, newStock];
    });
  };

  const removeStock = (symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s.symbol !== symbol));
  };

  const isStockInWatchlist = (symbol: string) => {
    return watchlist.some((s) => s.symbol === symbol);
  };

  return (
    <WatchlistContext.Provider value={{ 
      watchlist, addStock, removeStock, isStockInWatchlist, 
      refreshPrices, forceRefresh, refreshStock, updateAiVerdict, isRefreshing, clearWatchlist 
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist(): WatchlistContextValue {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used inside <WatchlistProvider>');
  return ctx;
}
