'use client';

import React from 'react';
import styles from '../../page.module.css';

interface SummaryCardsProps {
  totalStocks: number;
  gainersCount: number;
  gainersPercent: string;
  losersCount: number;
  losersPercent: string;
  avgDailyPerformance: string;
  openMarkets: number;
  closedMarkets: number;
  lastSync: string;
}

export default function SummaryCards({
  totalStocks,
  gainersCount,
  gainersPercent,
  losersCount,
  losersPercent,
  avgDailyPerformance,
  openMarkets,
  closedMarkets,
  lastSync
}: SummaryCardsProps) {

  let avgColorClass = '';
  if (avgDailyPerformance.startsWith('+')) avgColorClass = styles.cardValueGreen;
  else if (avgDailyPerformance.startsWith('-')) avgColorClass = styles.cardValueRed;
  else avgColorClass = ''; // Gray for Zero, relying on default .cardValue color if it's neither

  return (
    <div className={styles.summaryGrid}>
      {/* Total Stocks */}
      <div className={styles.card}>
        <div className={`${styles.cardIcon} ${styles.cardIconBlue}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <div className={styles.cardContent}>
          <span className={styles.cardLabel}>Total Stocks</span>
          <span className={styles.cardValue}>{totalStocks}</span>
        </div>
      </div>

      {/* Gainers */}
      <div className={styles.card}>
        <div className={`${styles.cardIcon} ${styles.cardIconGreen}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
            <polyline points="18 9 12 3 6 9"></polyline>
          </svg>
        </div>
        <div className={styles.cardContent}>
          <span className={styles.cardLabel}>Gainers</span>
          <span className={styles.cardValue}>
            {gainersCount}
            <span className={`${styles.cardSubValue} ${styles.cardValueGreen}`}>{gainersPercent}</span>
          </span>
        </div>
      </div>

      {/* Losers */}
      <div className={styles.card}>
        <div className={`${styles.cardIcon} ${styles.cardIconRed}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
            <polyline points="6 15 12 21 18 15"></polyline>
          </svg>
        </div>
        <div className={styles.cardContent}>
          <span className={styles.cardLabel}>Losers</span>
          <span className={styles.cardValue}>
            {losersCount}
            <span className={`${styles.cardSubValue} ${styles.cardValueRed}`}>{losersPercent}</span>
          </span>
        </div>
      </div>

      {/* Avg Daily Performance */}
      <div className={styles.card}>
        <div className={`${styles.cardIcon} ${styles.cardIconPurple}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div className={styles.cardContent}>
          <span className={styles.cardLabel}>Average Daily Performance</span>
          <span className={`${styles.cardValue} ${avgColorClass}`}>
            {avgDailyPerformance}
          </span>
        </div>
      </div>

      {/* Market Overview */}
      <div className={styles.card}>
        <div className={`${styles.cardIcon} ${styles.cardIconOrange}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </div>
        <div className={styles.cardContent}>
          <span className={styles.cardLabel}>Market Overview</span>
          <span className={styles.cardValue} style={{ fontSize: '0.95rem' }}>
            Open Markets: {openMarkets}
            <span className={styles.cardSubValue} style={{ fontSize: '0.85rem' }}>Closed Markets: {closedMarkets}</span>
            <span className={styles.cardDate}>Last Sync: {lastSync}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
