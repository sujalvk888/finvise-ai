'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '../dashboard/layout/DashboardLayout';
import WatchlistHeader from './components/WatchlistHeader/WatchlistHeader';
import SummaryCards from './components/SummaryCards/SummaryCards';
import WatchlistTable from './components/WatchlistTable/WatchlistTable';
import AddStockModal from './components/AddStockModal/AddStockModal';
import { useWatchlist } from '../dashboard/context/WatchlistContext';
import styles from './page.module.css';

function WatchlistContent() {
  const { watchlist } = useWatchlist();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWatchlist = useMemo(() => {
    if (!searchQuery) return watchlist;
    const q = searchQuery.toLowerCase();
    return watchlist.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.company.toLowerCase().includes(q)
    );
  }, [watchlist, searchQuery]);

  const totalStocks = watchlist.length;
  
  const parseNum = (str: string) => parseFloat(str.replace(/[^0-9.-]+/g, '')) || 0;
  const gainers = watchlist.filter(s => parseNum(s.change) > 0);
  const losers = watchlist.filter(s => parseNum(s.change) < 0);
  
  const openMarkets = watchlist.filter(s => s.marketStatus.includes('Open') || s.marketStatus.includes('Pre')).length;
  const closedMarkets = watchlist.filter(s => s.marketStatus.includes('Closed') || s.marketStatus.includes('After')).length;
  
  const lastSyncTime = watchlist.length > 0 
    ? [...watchlist].sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.lastUpdated}`).getTime();
        const timeB = new Date(`1970/01/01 ${b.lastUpdated}`).getTime();
        return timeB - timeA;
      })[0].lastUpdated 
    : 'Never';
  
  // Calculate average daily performance percentage
  let validPercentCount = 0;
  const totalChangePercent = watchlist.reduce((acc, s) => {
    const val = parseFloat(s.changePercent);
    if (!isNaN(val)) {
      validPercentCount++;
      return acc + val;
    }
    return acc;
  }, 0);
  const avgChangeNum = validPercentCount > 0 ? totalChangePercent / validPercentCount : 0;
  const avgChange = avgChangeNum.toFixed(2);
  const avgDailyPerformanceStr = avgChangeNum > 0 ? `+${avgChange}%` : (avgChangeNum < 0 ? `${avgChange}%` : '0.00%');
  
  const gainersPercent = totalStocks > 0 ? ((gainers.length / totalStocks) * 100).toFixed(2) + '%' : '0%';
  const losersPercent = totalStocks > 0 ? ((losers.length / totalStocks) * 100).toFixed(2) + '%' : '0%';

  const handleAddClick = React.useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = React.useCallback(() => setIsModalOpen(false), []);
  
  return (
    <>
      <div className={styles.watchlistContainer}>
        <WatchlistHeader 
          onAddClick={handleAddClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <SummaryCards 
          totalStocks={totalStocks}
          gainersCount={gainers.length}
          gainersPercent={gainersPercent}
          losersCount={losers.length}
          losersPercent={losersPercent}
          avgDailyPerformance={avgDailyPerformanceStr}
          openMarkets={openMarkets}
          closedMarkets={closedMarkets}
          lastSync={lastSyncTime}
        />
        <WatchlistTable stocks={filteredWatchlist} />
      </div>
      <AddStockModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}

export default function WatchlistPage() {
  return (
    <DashboardLayout>
      <WatchlistContent />
    </DashboardLayout>
  );
}
