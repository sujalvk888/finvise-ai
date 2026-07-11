import React, { useState, useEffect } from 'react';
import { useAiEngine } from '../../context/AiEngineContext';
import { dashboardStorage, SavedAnalysis } from '../../services/dashboardStorage';
import styles from './Header.module.css';

interface HeaderProps {
  ticker: string;
  onTickerChange: (value: string) => void;
  onAnalyze: (isRefresh?: boolean) => void;
  loading: boolean;
  onMenuClick?: () => void;
}

export default function Header({ ticker, onTickerChange, onAnalyze, loading, onMenuClick }: HeaderProps) {
  const { engineModeLabel } = useAiEngine();
  const [cachedAnalysis, setCachedAnalysis] = useState<SavedAnalysis | null>(null);

  useEffect(() => {
    // Update the cache check whenever ticker changes
    const analysis = dashboardStorage.get(ticker.trim());
    setTimeout(() => {
      setCachedAnalysis(analysis);
    }, 0);
  }, [ticker, loading]); // Also re-check when loading finishes

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) {
      onAnalyze(!!cachedAnalysis);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.searchSection}>
        <div className={styles.headerTop}>
          <button className={styles.hamburgerBtn} onClick={onMenuClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <form onSubmit={handleFormSubmit} className={styles.searchForm}>
          <div className={styles.searchContainer}>
            <div className={styles.searchIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              id="stock-ticker-input"
              type="text"
              placeholder="Enter stock ticker (e.g., TSLA, AAPL, MSFT)"
              className={styles.searchInput}
              value={ticker}
              onChange={(e) => onTickerChange(e.target.value)}
              disabled={loading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
            />
            <button
              id="analyze-btn"
              type="submit"
              className={`${styles.analyzeBtn} ${loading ? styles.analyzeBtnLoading : ''}`}
              disabled={loading || !ticker.trim()}
              aria-label={loading ? (cachedAnalysis ? 'Refreshing...' : 'Analyzing...') : (cachedAnalysis ? 'Refresh Analysis' : 'Analyze stock')}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  {cachedAnalysis ? 'Refreshing...' : 'Analyzing...'}
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                  <span className={styles.btnText}>{cachedAnalysis ? 'Refresh Analysis' : 'Analysis'}</span>
                </>
              )}
            </button>
          </div>
        </form>
        </div>
        {cachedAnalysis && !loading && (
          <div className={styles.timestampRow}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>AI Analysis Updated: {cachedAnalysis.timestamp}</span>
          </div>
        )}
      </div>

      <div className={styles.headerRight}>
        <div className={styles.modelBadge}>
          <span className={styles.statusDot}></span>
          <span className={styles.modelName}>{engineModeLabel}</span>
        </div>
      </div>
    </header>
  );
}

