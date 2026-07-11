'use client';

import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { StockData, HistoricalDataPoint } from '../../../types/stock';
import { formatCurrency } from '../../../utils/currency';
import styles from './FinancialMetricCards.module.css';

interface Props {
  data: StockData;
  historicalData?: HistoricalDataPoint[] | null;
  isLoading?: boolean;
}

interface Metric {
  title: string;
  value: string;
  subtitle: string;
  subtitleColor?: string;
  insight?: { text: string; color: string; label?: string };
  badge?: { text: string; colorClass: string };
  trend: string;
  icon: React.ReactNode;
  color: string;
  isHistoricalAvailable: boolean;
}

function fmt(value: number | null | undefined, suffix = ''): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) + suffix;
}

export default function FinancialMetricCards({ data, historicalData, isLoading }: Props) {
  const getPriceDiff = () => {
    if (data.current_price && data.previous_close) {
      const diff = data.current_price - data.previous_close;
      const pct = (diff / data.previous_close) * 100;
      const sign = diff >= 0 ? '+' : '';
      return `${sign}${formatCurrency(diff, data.currency)} (${sign}${pct.toFixed(2)}%)`;
    }
    return 'N/A';
  };

  const sparklineData = historicalData ? historicalData.slice(-30) : [];

  const marketPriceTrendColor = (() => {
    if (!sparklineData || sparklineData.length < 2) return 'neutral';
    const first = sparklineData[0].close;
    const last = sparklineData[sparklineData.length - 1].close;
    if (last > first) return 'up';
    if (last < first) return 'down';
    return 'neutral';
  })();

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#10b981';    // green
      case 'down': return '#ef4444';  // red
      case 'purple': return '#8b5cf6';
      case 'orange': return '#f59e0b';
      case 'blue': return '#3b82f6';
      default: return '#9ca3af';      // neutral
    }
  };

  const IND_PE = 24.18;
  const IND_MARGIN = 17.85;

  const peInsight = (() => {
    const isInvalidEps = data.validation_flags?.pe_invalid_negative_eps;
    if (isInvalidEps) return { text: 'P/E Unavailable (Negative Earnings)', color: 'neutral' };
    if (data.pe_ratio === null || data.pe_ratio === undefined) return { text: 'Unavailable', color: 'neutral' };
    
    const diffPct = ((data.pe_ratio - IND_PE) / IND_PE) * 100;
    if (diffPct > 500) {
      const multiple = (data.pe_ratio / IND_PE).toFixed(1);
      return { text: `${multiple}x Industry`, color: 'down' };
    }
    
    if (Math.abs(diffPct) <= 5) return { text: `Near Industry`, color: 'neutral' };
    if (diffPct > 5) return { text: `Premium +${diffPct.toFixed(1)}%`, color: 'down' };
    return { text: `Discount ${diffPct.toFixed(1)}%`, color: 'up' };
  })();

  const debtInsight = (() => {
    if (data.debt_to_equity === null || data.debt_to_equity === undefined) {
      return { subtitle: 'Data Unavailable', status: 'Unavailable', colorClass: 'neutralBadge' };
    }
    const val = data.debt_to_equity;
    if (val <= 0.50) return { subtitle: 'Very Low Risk', status: 'Excellent Balance Sheet', colorClass: 'greenBadge' };
    if (val <= 1.00) return { subtitle: 'Low Risk', status: 'Healthy Balance Sheet', colorClass: 'greenBadge' };
    if (val <= 2.00) return { subtitle: 'Moderate Risk', status: 'Balanced Leverage', colorClass: 'orangeBadge' };
    if (val <= 3.00) return { subtitle: 'High Risk', status: 'Heavy Debt Load', colorClass: 'redBadge' };
    return { subtitle: 'Very High Risk', status: 'Highly Leveraged', colorClass: 'darkRedBadge' };
  })();

  const marginInsight = (() => {
    const isInvalidMargin = data.validation_flags?.gross_margin_invalid;
    if (isInvalidMargin) return { text: 'Financial Data Unavailable', color: 'neutral' };
    if (data.gross_margin === null || data.gross_margin === undefined) return { text: 'Unavailable', color: 'neutral' };
    
    const diff = data.gross_margin - IND_MARGIN;
    if (Math.abs(diff) <= 2) return { text: `Similar (±2%)`, color: 'neutral' };
    if (diff > 2) return { text: `Above Industry +${diff.toFixed(1)}%`, color: 'up' };
    return { text: `Below Industry ${diff.toFixed(1)}%`, color: 'down' };
  })();

  const metrics: Metric[] = [
    {
      title: 'Market Price',
      value: data.current_price !== null ? formatCurrency(data.current_price, data.currency) : 'N/A',
      subtitle: getPriceDiff(),
      trend: marketPriceTrendColor,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
      color: 'green',
      isHistoricalAvailable: true
    },
    {
      title: 'P/E Ratio (TTM)',
      value: data.validation_flags?.pe_invalid_negative_eps ? 'N/A' : fmt(data.pe_ratio),
      subtitle: `Industry Avg: ${IND_PE}`,
      insight: peInsight,
      trend: 'purple',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
      color: 'purple',
      isHistoricalAvailable: false
    },
    {
      title: 'Debt to Equity',
      value: fmt(data.debt_to_equity),
      subtitle: debtInsight.subtitle,
      badge: { text: debtInsight.status, colorClass: debtInsight.colorClass },
      trend: 'orange',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="5" x2="5" y2="19"></line>
          <circle cx="6.5" cy="6.5" r="2.5"></circle>
          <circle cx="17.5" cy="17.5" r="2.5"></circle>
        </svg>
      ),
      color: 'orange',
      isHistoricalAvailable: false
    },
    {
      title: 'Gross Profit Margin',
      value: data.validation_flags?.gross_margin_invalid ? 'N/A' : fmt(data.gross_margin, '%'),
      subtitle: `Industry Avg: ${IND_MARGIN}%`,
      insight: marginInsight,
      trend: 'blue',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
          <polyline points="16 7 22 7 22 13"></polyline>
        </svg>
      ),
      color: 'blue',
      isHistoricalAvailable: false
    }
  ];

  return (
    <div className={styles.grid}>
      {metrics.map((metric, idx) => (
        <div key={idx} className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.iconWrapper} ${styles[metric.color]}`}>
              {metric.icon}
            </div>
            <div className={styles.titleInfo}>
              <span className={styles.title}>{metric.title}</span>
            </div>
          </div>
          <div className={styles.valueArea}>
            <div className={styles.value}>{metric.value}</div>
            <div className={styles.bottomRow}>
              <span className={`${styles.subtitle} ${
                metric.subtitleColor === 'up' ? styles.subtitleGreen : 
                metric.subtitleColor === 'down' ? styles.subtitleRed : 
                metric.subtitleColor === 'orange' ? styles.subtitleOrange :
                metric.trend === 'up' ? styles.subtitleGreen : 
                metric.trend === 'down' ? styles.subtitleRed : ''
              }`}>
                {metric.subtitle}
              </span>
              {metric.isHistoricalAvailable ? (
                <div className={styles.miniChart}>
                  {isLoading ? (
                    <div className={styles.sparklineSkeleton}></div>
                  ) : sparklineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineData}>
                        <defs>
                          <linearGradient id={`color-${metric.trend}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={getTrendColor(metric.trend)} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={getTrendColor(metric.trend)} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <YAxis domain={['dataMin', 'dataMax']} hide />
                        <Area 
                          type="monotone" 
                          dataKey="close" 
                          stroke={getTrendColor(metric.trend)} 
                          fill={`url(#color-${metric.trend})`}
                          strokeWidth={2} 
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              ) : metric.badge ? (
                <div className={`${styles.badge} ${styles[metric.badge.colorClass]}`}>
                  {metric.badge.text}
                </div>
              ) : metric.insight ? (
                <div className={`${styles.insightText} ${styles[metric.insight.color]}`}>
                  {metric.insight.text}
                </div>
              ) : (
                <div className={styles.noHistoryPlaceholder}>
                  <span>Trend N/A</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
