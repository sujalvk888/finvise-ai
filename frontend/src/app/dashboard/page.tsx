'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearch } from './context/SearchContext';
import { useDashboardContext } from './context/DashboardContext';
import { useStockAnalysis } from './hooks/useStockAnalysis';
import DashboardView from './components/DashboardView/DashboardView';
import styles from './page.module.css';

function DashboardContent() {
  const searchParams = useSearchParams();
  const { ticker, setTicker, registerAnalyzeCallback, setLoading } = useSearch();
  const { isRefreshingFlag } = useDashboardContext();
  const { analyze, data, loading, error } = useStockAnalysis();
  const initializedRef = useRef(false);

  // Keep layout loading state in sync with hook loading state
  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  // Handle URL parameter on mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const urlTicker = searchParams.get('ticker');
      if (urlTicker && urlTicker !== ticker) {
        setTicker(urlTicker);
        analyze(urlTicker);
      }
    }
  }, [searchParams, ticker, setTicker, analyze]);

  // Register the analyze callback with the context so the Header button can trigger it
  useEffect(() => {
    registerAnalyzeCallback((isRefresh?: boolean) => {
      analyze(ticker, isRefresh);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, registerAnalyzeCallback, analyze]);

  return (
    <div className={styles.container}>
      {/* Welcome message — shown only when no search has been performed */}
      {!data && !loading && !error && (
        <div className={styles.welcomeState}>
          <h1 className={styles.heading}>Dashboard</h1>
          <p className={styles.description}>
            Enter a stock ticker in the search bar above and click <strong>Analysis</strong> to get started.
          </p>
        </div>
      )}

      {/* Error state — shown as a banner but old data is kept visible below */}
      {error && !loading && (
        <div className={styles.errorBox} role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {/* Loading state - Skeletons */}
      {loading && !isRefreshingFlag && (
        <div className={styles.skeletonContainer}>
          <div className={`${styles.skeletonCard} ${styles.skeletonOverview}`}></div>
          <div className={styles.skeletonMetricsGrid}>
            <div className={`${styles.skeletonCard} ${styles.skeletonMetric}`}></div>
            <div className={`${styles.skeletonCard} ${styles.skeletonMetric}`}></div>
            <div className={`${styles.skeletonCard} ${styles.skeletonMetric}`}></div>
            <div className={`${styles.skeletonCard} ${styles.skeletonMetric}`}></div>
          </div>
          <div className={styles.skeletonBottomRow}>
            <div className={`${styles.skeletonCard} ${styles.skeletonChart}`}></div>
            <div className={`${styles.skeletonCard} ${styles.skeletonAi}`}></div>
          </div>
        </div>
      )}

      {/* Stock data result */}
      {data && (!loading || isRefreshingFlag) && <DashboardView data={data} />}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className={styles.container}><div className={styles.loadingContainer}>Loading Dashboard...</div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
