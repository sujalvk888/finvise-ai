'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWatchlist } from '../../../dashboard/context/WatchlistContext';
import { stockService } from '../../../dashboard/services/stockService';
import styles from './AddStockModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStockModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addStock, isStockInWatchlist } = useWatchlist();
  const [popularStocks, setPopularStocks] = useState<{ symbol: string; name: string; }[]>([]);

  useEffect(() => {
    if (isOpen) {
      stockService.getPopularStocks().then(stocks => {
        setPopularStocks(stocks);
      }).catch(err => console.error("Failed to fetch popular stocks", err));
    }
  }, [isOpen]);

  const displayedPopular = useMemo(() => {
    let filtered = popularStocks.filter(stock => !isStockInWatchlist(stock.symbol));
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(stock => 
        stock.symbol.toLowerCase().includes(q) || 
        stock.name.toLowerCase().includes(q)
      );
    }
    return filtered.slice(0, 4);
  }, [popularStocks, isStockInWatchlist, query]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    await addByTicker(query);
  };

  const addByTicker = async (ticker: string) => {
    if (isStockInWatchlist(ticker.toUpperCase())) {
      setError('Stock is already in your watchlist.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await stockService.analyzeStock(ticker);
      addStock(data);
      onClose();
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 className={styles.title}>Add Stock</h2>
        <p className={styles.subtitle}>Search for a ticker to add to your watchlist.</p>

        <form onSubmit={handleSearch}>
          <div className={styles.searchContainer}>
            <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="E.g. AAPL, TSLA"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              disabled={loading}
              autoFocus
            />
          </div>
          {error && <div className={styles.errorMsg}>{error}</div>}
          <button type="submit" style={{ display: 'none' }}>Submit</button>
        </form>

        <div className={styles.recentSection}>
          <div className={styles.sectionTitle}>Popular Stocks</div>
          <div className={styles.stockList}>
            {displayedPopular.length > 0 ? displayedPopular.map(stock => (
              <div 
                key={stock.symbol} 
                className={styles.stockItem}
                onClick={() => !loading && addByTicker(stock.symbol)}
              >
                <div className={styles.stockInfo}>
                  <span className={styles.stockSymbol}>{stock.symbol}</span>
                  <span className={styles.stockName}>{stock.name}</span>
                </div>
                <div className={styles.addIcon}>
                  {loading && query === stock.symbol ? (
                    <span>...</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  )}
                </div>
              </div>
            )) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)' }}>No new popular stocks to add.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
