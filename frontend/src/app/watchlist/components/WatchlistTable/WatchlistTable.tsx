'use client';

import React, { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useWatchlist } from '../../../dashboard/context/WatchlistContext';
import { WatchlistStock } from '../../../dashboard/types/watchlist';
import Sparkline from '../Sparkline/Sparkline';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import styles from '../../page.module.css';

interface WatchlistTableProps {
  stocks: WatchlistStock[];
}

type SortField = 'price' | 'change' | 'marketCap' | 'aiVerdict' | 'company' | 'added';
type SortDir = 'asc' | 'desc';

// Extracted and memoized row component for performance (100+ stocks)
const WatchlistRow = memo(({ 
  stock, 
  index, 
  onRowClick, 
  onDelete,
  onRefresh
}: { 
  stock: WatchlistStock; 
  index: number; 
  onRowClick: (symbol: string) => void;
  onDelete: (e: React.MouseEvent, symbol: string) => void;
  onRefresh: (e: React.MouseEvent, symbol: string) => void;
}) => {
  const [imgError, setImgError] = useState(false);
  const isPositive = stock.change.startsWith('+');
  
  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'Strong Buy':
      case 'Buy': return styles.badgeBuy;
      case 'Sell':
      case 'Reduce': return styles.badgeSell;
      case 'Hold': return styles.badgeHold;
      default: return ''; // No special badge class for Not Analyzed
    }
  };

  const getStatusClass = (status: string) => {
    // Handle both potential formats
    if (status.includes('Open')) return styles.statusOpen;
    if (status.includes('Closed')) return styles.statusClosed;
    if (status.includes('Pre')) return styles.statusPre;
    if (status.includes('After')) return styles.statusAfter;
    return styles.statusUnknown;
  };

  return (
    <tr 
      onClick={() => onRowClick(stock.symbol)}
      style={{ cursor: 'pointer' }}
      className={styles.tableRowHover}
    >
      <td>{index + 1}</td>
      <td>
        <div className={styles.companyCell}>
          <div className={styles.companyLogo}>
            {stock.logoUrl && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={stock.logoUrl} 
                alt={`${stock.symbol} logo`} 
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                onError={() => setImgError(true)}
              />
            ) : (
              <span style={{ fontWeight: 600, color: 'var(--dash-text-muted)' }}>{stock.company[0]}</span>
            )}
          </div>
          <div className={styles.companyInfo}>
            <span className={styles.companyName}>{stock.company}</span>
            <span className={styles.companySector}>{stock.sector}</span>
          </div>
        </div>
      </td>
      <td className={styles.symbolCell}>{stock.symbol}</td>
      <td className={styles.priceCell}>{stock.price}</td>
      <td className={isPositive ? styles.changePositive : styles.changeNegative}>
        {stock.change} ({stock.changePercent})
      </td>
      <td>
        <div style={{ width: '60px', height: '24px' }}>
          <Sparkline symbol={stock.symbol} />
        </div>
      </td>
      <td>{stock.marketCap}</td>
      <td>
        <span className={`${styles.badge} ${getVerdictBadge(stock.aiVerdict)}`}>
          {stock.aiVerdict}
        </span>
      </td>
      <td>
        <div className={`${styles.statusCell} ${getStatusClass(stock.marketStatus)}`}>
          <div className={styles.statusDot}></div>
          {stock.marketStatus}
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.85rem' }}>
            {stock.lastUpdated}
          </span>
        </div>
      </td>
      <td>
        <div className={styles.actionsCell}>
          <button 
            title="Refresh Stock Data"
            className={styles.actionBtn} 
            onClick={(e) => onRefresh(e, stock.symbol)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
          <button 
            title="Remove from Watchlist"
            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
            onClick={(e) => onDelete(e, stock.symbol)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
});
WatchlistRow.displayName = 'WatchlistRow';

export default function WatchlistTable({ stocks }: WatchlistTableProps) {
  const router = useRouter();
  const { removeStock } = useWatchlist();
  
  const [sortField, setSortField] = useState<SortField>('added');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    let comparison = 0;
    
    // Helper to parse currency/percentage strings to numbers
    const parseNum = (str: string) => parseFloat(str.replace(/[^0-9.-]+/g, '')) || 0;
    
    switch (sortField) {
      case 'price':
        comparison = parseNum(a.price) - parseNum(b.price);
        break;
      case 'change':
        comparison = parseNum(a.change) - parseNum(b.change);
        break;
      case 'marketCap':
        // Extremely simplified comparison for Trillions/Billions
        const getMarketCapVal = (val: string) => {
          const num = parseNum(val);
          if (val.includes('T')) return num * 1000;
          if (val.includes('B')) return num;
          if (val.includes('M')) return num / 1000;
          return num;
        };
        comparison = getMarketCapVal(a.marketCap) - getMarketCapVal(b.marketCap);
        break;
      case 'aiVerdict':
        const verdictWeight: Record<string, number> = { 'Buy': 3, 'Hold': 2, 'Sell': 1 };
        comparison = (verdictWeight[a.aiVerdict] || 0) - (verdictWeight[b.aiVerdict] || 0);
        break;
      case 'company':
        comparison = a.company.localeCompare(b.company);
        break;
      case 'added':
      default:
        comparison = a.id - b.id;
        break;
    }
    
    return sortDir === 'asc' ? comparison : -comparison;
  });

  const handleRowClick = React.useCallback((symbol: string) => {
    router.push(`/dashboard?ticker=${symbol}`);
  }, [router]);

  const [deleteSymbol, setDeleteSymbol] = useState<string | null>(null);

  const handleDeleteClick = React.useCallback((e: React.MouseEvent, symbol: string) => {
    e.stopPropagation(); 
    setDeleteSymbol(symbol);
  }, [setDeleteSymbol]);

  const confirmDelete = React.useCallback(() => {
    if (deleteSymbol) {
      removeStock(deleteSymbol);
      setDeleteSymbol(null);
    }
  }, [deleteSymbol, removeStock, setDeleteSymbol]);

  const { refreshStock } = useWatchlist();
  const handleRefresh = React.useCallback((e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    refreshStock(symbol);
  }, [refreshStock]);

  if (stocks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <h3 className={styles.emptyTitle}>No stocks in your watchlist.</h3>
        <p className={styles.emptyDesc}>Add your first stock to begin tracking.</p>
        <button className={styles.addBtn}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Stock
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th style={{cursor: 'pointer'}} onClick={() => handleSort('company')}>
                Company {sortField === 'company' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th>Symbol</th>
              <th style={{cursor: 'pointer'}} onClick={() => handleSort('price')}>
                Price {sortField === 'price' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{cursor: 'pointer'}} onClick={() => handleSort('change')}>
                Change (1D) {sortField === 'change' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th>Mini Trend Graph</th>
              <th style={{cursor: 'pointer'}} onClick={() => handleSort('marketCap')}>
                Market Cap {sortField === 'marketCap' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{cursor: 'pointer'}} onClick={() => handleSort('aiVerdict')}>
                AI Verdict {sortField === 'aiVerdict' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th>Market Status</th>
              <th style={{cursor: 'pointer'}} onClick={() => handleSort('added')}>
                Last Updated {sortField === 'added' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stock, index) => (
              <WatchlistRow 
                key={stock.id}
                stock={stock}
                index={index}
                onRowClick={handleRowClick}
                onDelete={handleDeleteClick}
                onRefresh={handleRefresh}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.disclaimer}>
        <div className={styles.disclaimerIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        Click on any stock to view detailed analysis on the dashboard.
      </div>
      <ConfirmModal
        isOpen={deleteSymbol !== null}
        onClose={() => setDeleteSymbol(null)}
        onConfirm={confirmDelete}
        title="Remove from Watchlist"
        message={`Are you sure you want to remove ${deleteSymbol} from your watchlist?`}
        confirmText="Remove"
      />
    </div>
  );
}
