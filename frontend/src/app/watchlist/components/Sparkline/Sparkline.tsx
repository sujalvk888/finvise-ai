'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { stockService } from '../../../dashboard/services/stockService';
import { HistoricalDataPoint } from '../../../dashboard/types/stock';
import styles from './Sparkline.module.css';

interface Props {
  symbol: string;
}

export default function Sparkline({ symbol }: Props) {
  const [data, setData] = useState<HistoricalDataPoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchHistory = async () => {
      try {
        const history = await stockService.getHistoricalData(symbol, '6M');
        if (isMounted) {
          const sparklineData = history.data ? history.data.slice(-30) : [];
          setData(sparklineData);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error(`Failed to fetch sparkline data for ${symbol}`, error);
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  // Generate SVG path points and determine trend
  const { pathD, trendColor } = useMemo(() => {
    if (!data || data.length < 2) {
      return { pathD: null, trendColor: 'neutral' };
    }

    // Map data points to SVG coordinates (0-60 width, 0-24 height)
    const prices = data.map(d => d.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    
    // Determine trend exactly as Dashboard does
    const firstVal = data[0].close;
    const lastVal = data[data.length - 1].close;
    let color = 'neutral';
    if (lastVal > firstVal) color = 'positive';
    if (lastVal < firstVal) color = 'negative';
    
    // If there's no variation (straight line), draw a line in the middle
    if (range === 0) {
      return { pathD: "M0,12 L60,12", trendColor: color };
    }

    const pathPoints = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * 60;
      // Y is inverted (0 is top, 24 is bottom), add 2px padding top/bottom
      const y = 22 - (((price - min) / range) * 20); 
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return { pathD: pathPoints.join(' '), trendColor: color };
  }, [data]);

  if (loading) {
    return (
      <div className={styles.sparklineContainer}>
        <div className={styles.loading}></div>
      </div>
    );
  }
  
  if (!pathD) {
    return (
      <div className={styles.sparklineContainer} style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>Trend unavailable</span>
      </div>
    );
  }

  return (
    <div className={styles.sparklineContainer}>
      <svg className={styles.sparklineSvg} viewBox="0 0 60 24" preserveAspectRatio="none">
        <path 
          className={`${styles.sparklinePath} ${trendColor === 'positive' ? styles.positive : trendColor === 'negative' ? styles.negative : ''}`}
          d={pathD} 
        />
      </svg>
    </div>
  );
}
