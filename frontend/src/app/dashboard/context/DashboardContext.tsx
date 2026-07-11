'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { StockData, HistoricalDataPoint, AiReport } from '../types/stock';
import { dashboardStorage, SavedAnalysis } from '../services/dashboardStorage';

interface DashboardContextValue {
  cachedAnalysis: SavedAnalysis | null;
  setCachedAnalysis: (analysis: SavedAnalysis | null) => void;
  isRefreshingFlag: boolean;
  setIsRefreshingFlag: (flag: boolean) => void;
  // Methods for tracking current active fetches
  activeStockData: StockData | null;
  setActiveStockData: (data: StockData | null) => void;
  activeHistoricalData: HistoricalDataPoint[] | null;
  setActiveHistoricalData: (data: HistoricalDataPoint[] | null) => void;
  activeChartTimeframe: string;
  setActiveChartTimeframe: (timeframe: string) => void;
  activeChartType: string;
  setActiveChartType: (type: string) => void;
  activeAiReport: AiReport | null;
  setActiveAiReport: (report: AiReport | null) => void;
  
  // Triggers the save to localStorage
  saveCurrentAnalysis: (ticker: string, engine: string) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [cachedAnalysis, setCachedAnalysis] = useState<SavedAnalysis | null>(null);
  const [isRefreshingFlag, setIsRefreshingFlag] = useState<boolean>(false);
  
  const [activeStockData, setActiveStockData] = useState<StockData | null>(null);
  const [activeHistoricalData, setActiveHistoricalData] = useState<HistoricalDataPoint[] | null>(null);
  const [activeChartTimeframe, setActiveChartTimeframe] = useState<string>('6M');
  const [activeChartType, setActiveChartType] = useState<string>('Area');
  const [activeAiReport, setActiveAiReport] = useState<AiReport | null>(null);

  const saveCurrentAnalysis = useCallback((ticker: string, engine: string) => {
    if (activeStockData && activeHistoricalData && activeAiReport) {
      dashboardStorage.save(ticker, {
        stockData: activeStockData,
        aiReport: activeAiReport,
        historicalData: activeHistoricalData,
        engine,
        chartTimeframe: activeChartTimeframe,
        chartType: activeChartType
      });
    }
  }, [activeStockData, activeHistoricalData, activeAiReport, activeChartTimeframe, activeChartType]);

  return (
    <DashboardContext.Provider value={{
      cachedAnalysis,
      setCachedAnalysis,
      isRefreshingFlag,
      setIsRefreshingFlag,
      activeStockData,
      setActiveStockData,
      activeHistoricalData,
      setActiveHistoricalData,
      activeChartTimeframe,
      setActiveChartTimeframe,
      activeChartType,
      setActiveChartType,
      activeAiReport,
      setActiveAiReport,
      saveCurrentAnalysis
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboardContext must be used within DashboardProvider');
  return ctx;
}
