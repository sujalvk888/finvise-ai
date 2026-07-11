'use client';

import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { stockService } from '../../../services/stockService';
import { HistoricalDataPoint } from '../../../types/stock';
import { useDashboardContext } from '../../../context/DashboardContext';
import styles from './ChartPlaceholder.module.css';

interface Props {
  ticker?: string;
  currency?: string;
  onDataLoaded?: (data: HistoricalDataPoint[] | null) => void;
  onLoadingChange?: (loading: boolean) => void;
}

const TIME_RANGES = ['1M', '3M', '6M', '1Y', '5Y', 'MAX'];

import { getCurrencySymbol } from '../../../utils/currency';

const CustomTooltip = ({ active, payload, label, currency }: { active?: boolean; payload?: { value: number }[]; label?: string; currency?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipActive}>
        <div className={styles.tooltipDate}>{label}</div>
        <div className={styles.tooltipValue}>
          <span className={styles.tooltipDot}></span>
          Price: {getCurrencySymbol(currency)}{payload[0].value.toFixed(2)}
        </div>
      </div>
    );
  }
  return null;
};

export default function ChartPlaceholder({ ticker, currency, onDataLoaded, onLoadingChange }: Props) {
  const { cachedAnalysis, setActiveHistoricalData, setActiveChartTimeframe, setActiveChartType, isRefreshingFlag } = useDashboardContext();

  const [timeRange, setTimeRangeState] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem('finvise_chart_time') : null;
      return stored && TIME_RANGES.includes(stored) ? stored : '6M';
    } catch { return '6M'; }
  });
  const [chartType, setChartTypeState] = useState<'Area' | 'Line'>(() => {
    try {
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem('finvise_chart_type') : null;
      return (stored === 'Area' || stored === 'Line') ? stored : 'Area';
    } catch { return 'Area'; }
  });
  
  // When a cached analysis is loaded, override local chart settings with cached settings
  useEffect(() => {
    if (cachedAnalysis) {
      setTimeout(() => {
        if (cachedAnalysis.chartTimeframe) {
          setTimeRangeState(cachedAnalysis.chartTimeframe);
        }
        if (cachedAnalysis.chartType) {
          setChartTypeState(cachedAnalysis.chartType as 'Area' | 'Line');
        }
      }, 0);
    }
  }, [cachedAnalysis]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveHistoricalData(data);
  }, [data, setActiveHistoricalData]);

  const setTimeRange = (range: string) => {
    setTimeRangeState(range);
    setActiveChartTimeframe(range);
    try { sessionStorage.setItem('finvise_chart_time', range); } catch {}
  };

  const setChartType = (type: 'Area' | 'Line') => {
    setChartTypeState(type);
    setActiveChartType(type);
    try { sessionStorage.setItem('finvise_chart_type', type); } catch {}
  };

  useEffect(() => {
    if (!ticker) return;

    let mounted = true;
    const cacheKey = `finvise_chart_data_${ticker}_${timeRange}`;

    const fetchData = async () => {
      if (isRefreshingFlag) {
        if (mounted) {
          setData([]);
          setLoading(true);
        }
      }

      // If we are loading a cached dashboard analysis, skip fetching
      if (!isRefreshingFlag && cachedAnalysis) {
        // However, if the user manually changes the timeRange *after* loading a cached analysis, 
        // we might not have it in the cachedAnalysis. But cachedAnalysis is tied to the dashboard load.
        // Actually, if cachedAnalysis is active, its historicalData is what we should show initially.
        // But if timeRange changes, we still need to fetch new data unless it matches the cached one.
        if (cachedAnalysis.chartTimeframe === timeRange) {
           setData(cachedAnalysis.historicalData);
           if (onDataLoaded) onDataLoaded(cachedAnalysis.historicalData);
           setLoading(false);
           return;
        }
      }

      if (!isRefreshingFlag) {
        try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (mounted) {
            setData(parsed);
            setLoading(false);
            if (onDataLoaded) onDataLoaded(parsed);
          }
          return; // Skip fetch if cached
        }
      } catch {}
      }

      setLoading(true);
      setError(null);
      if (onLoadingChange) onLoadingChange(true);
      if (onDataLoaded) onDataLoaded(null);

      try {
        const response = await stockService.getHistoricalData(ticker, timeRange);
        if (mounted) {
          const fetchedData = response.data || [];
          setData(fetchedData);
          if (onDataLoaded) onDataLoaded(fetchedData);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(fetchedData));
          } catch {}
        }
      } catch (err: unknown) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Historical price data is currently unavailable.';
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          if (onLoadingChange) onLoadingChange(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [ticker, timeRange, onDataLoaded, onLoadingChange, cachedAnalysis, isRefreshingFlag]);

  // Handle escape key for expanded modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    if (isExpanded) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  // If no ticker, return empty state
  if (!ticker) {
    // Notify parent to hide loading and empty data if ticker is missing
    if (onLoadingChange) onLoadingChange(false);
    if (onDataLoaded) onDataLoaded(null);

    return (
      <div className={styles.card}>
        <div className={styles.emptyState}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--dash-text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <p>Search a stock to view historical price performance.</p>
        </div>
      </div>
    );
  }

  const chartInner = (isModal: boolean) => (
    <>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1ec8b4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <h3 className={styles.title}>Price History ({timeRange})</h3>
        </div>

        <div className={styles.controls}>
          <div className={styles.timeRange}>
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                className={`${styles.timeBtn} ${timeRange === range ? styles.active : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>

          <div className={styles.dropdownContainer}>
            <div className={styles.dropdown} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <span>{chartType} Chart</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div
                  className={`${styles.dropdownItem} ${chartType === 'Area' ? styles.activeDropdown : ''}`}
                  onClick={() => { setChartType('Area'); setIsDropdownOpen(false); }}
                >
                  Area Chart
                </div>
                <div
                  className={`${styles.dropdownItem} ${chartType === 'Line' ? styles.activeDropdown : ''}`}
                  onClick={() => { setChartType('Line'); setIsDropdownOpen(false); }}
                >
                  Line Chart
                </div>
              </div>
            )}
          </div>

          <button className={styles.iconBtn} onClick={() => setIsExpanded(!isModal)} title={isModal ? 'Collapse' : 'Expand'}>
            {isModal ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" y1="10" x2="21" y2="3"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {loading ? (
          <div className={styles.skeletonChart}></div>
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : data.length === 0 ? (
          <div className={styles.errorState}>Historical price data is currently unavailable.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1ec8b4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1ec8b4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--dash-border)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--dash-text-muted)', fontSize: 12 }}
                tickMargin={12}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--dash-text-muted)', fontSize: 12 }}
                tickFormatter={(value) => `${getCurrencySymbol(currency)}${value}`}
                width={80}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              {chartType === 'Area' ? (
                <Area 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#1ec8b4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorClose)"
                  isAnimationActive={true}
                  animationDuration={800}
                />
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#1ec8b4" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#1ec8b4', stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );

  const chartContent = (
    <div className={styles.card}>
      {chartInner(false)}
    </div>
  );

  const modalContent = isExpanded
    ? ReactDOM.createPortal(
        <div className={styles.modalBackdrop} onClick={() => setIsExpanded(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            {chartInner(true)}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {chartContent}
      {modalContent}
    </>
  );
}
