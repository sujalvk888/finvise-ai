/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { StockData } from '../../../types/stock';
import { useWatchlist } from '../../../context/WatchlistContext';
import { useDashboardContext } from '../../../context/DashboardContext';
import styles from './CompanyOverviewCard.module.css';

interface Props {
  data: StockData;
  aiSummary?: string | null;
}

export default function CompanyOverviewCard({ data, aiSummary }: Props) {
  const isOpen = data.market_state === 'Open';
  const [imageError, setImageError] = useState(false);
  const { addStock, removeStock, isStockInWatchlist } = useWatchlist();
  const { activeAiReport } = useDashboardContext();

  const isAdded = isStockInWatchlist(data.symbol);

  const handleAdd = () => {
    addStock(data, activeAiReport?.verdict_label);
  };

  const handleRemove = () => {
    removeStock(data.symbol);
  };

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <div className={styles.logoAndTitle}>
          <div className={styles.logoContainer}>
            {data.logo_url && !imageError ? (
              <img 
                src={data.logo_url} 
                alt={`${data.symbol} logo`} 
                className={styles.logo} 
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={styles.logoFallback}>{data.symbol.substring(0, 1)}</div>
            )}
          </div>
          <div className={styles.titleArea}>
            <h2 className={styles.companyName}>
              {data.company_name || data.symbol} <span className={styles.symbolText}>({data.symbol})</span>
            </h2>
            <div className={styles.tags}>
              {data.exchange && <span className={styles.tagBadge}>{data.exchange}</span>}
              {data.industry && <span className={styles.tagBadge}>{data.industry}</span>}
              {data.sector && <span className={styles.tagBadge}>{data.sector}</span>}
            </div>
            <p className={styles.summaryText}>
              {aiSummary 
                ? aiSummary 
                : data.business_summary 
                  ? data.business_summary.length > 250 
                    ? `${data.business_summary.substring(0, 250)}...` 
                    : data.business_summary
                  : 'No business summary available.'}
            </p>
          </div>
        </div>
        
        <div className={styles.marketStatusArea}>
          <div className={styles.statusLabel}>Market Status</div>
          <div className={`${styles.statusIndicator} ${isOpen ? styles.open : styles.closed}`}>
            <span className={styles.dot}></span>
            Market {data.market_state || 'Unknown'}
          </div>
          <div className={styles.lastUpdatedLabel}>Last Updated</div>
          <div className={styles.lastUpdatedValue}>{data.last_updated_time || 'Just now'}</div>
          
          <button 
            className={`${styles.addBtn} ${isAdded ? styles.addBtnAdded : ''}`}
            onClick={isAdded ? handleRemove : handleAdd}
          >
            {isAdded ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                Remove from Watchlist
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                Add to Watchlist
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
