'use client';

import { StockData } from '../../types/stock';
import styles from './StockResult.module.css';

interface StockResultProps {
  data: StockData;
}

// Helper: format numbers with commas, fallback to N/A
function fmt(
  value: number | string | null | undefined,
  options?: { decimals?: number; prefix?: string; suffix?: string }
): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  const { decimals = 2, prefix = '', suffix = '' } = options ?? {};
  return `${prefix}${num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

function fmtLargeNum(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'N/A';
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}T`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(2)}B`;
  return `$${val.toFixed(2)}M`;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value ?? <span className={styles.na}>N/A</span>}</span>
    </div>
  );
}

export default function StockResult({ data }: StockResultProps) {
  const isOpen = data.market_state === 'Open';

  return (
    <div className={styles.wrapper}>
      {/* ── Top Banner ── */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <h2>{data.company_name ?? data.symbol}</h2>
          <span className={styles.symbolBadge}>{data.symbol}</span>
        </div>
        <div className={styles.bannerRight}>
          <div>
            <span className={styles.priceValue}>
              {data.current_price != null ? fmt(data.current_price) : '—'}
            </span>
            <span className={styles.priceCurrency}>{data.currency ?? ''}</span>
          </div>
          <div
            className={`${styles.marketState} ${isOpen ? styles.open : styles.closed}`}
          >
            <span className={styles.stateDot} />
            {data.market_state ?? 'Unknown'}
          </div>
        </div>
      </div>

      {/* ── Data Grid ── */}
      <div className={styles.grid}>
        {/* Company Info */}
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Company</p>
          <Row label="Exchange"    value={data.exchange} />
          <Row label="Industry"    value={data.industry} />
          <Row label="Sector"      value={data.sector} />
          <Row label="Country"     value={data.country} />
          <Row
            label="Website"
            value={
              data.website ? (
                <a href={data.website} target="_blank" rel="noopener noreferrer">
                  {data.website.replace(/^https?:\/\//, '')}
                </a>
              ) : null
            }
          />
        </section>

        {/* Price Data */}
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Price</p>
          <Row label="Current Price"  value={fmt(data.current_price,  { prefix: '$' })} />
          <Row label="Previous Close" value={fmt(data.previous_close, { prefix: '$' })} />
          <Row label="Open"           value={fmt(data.open_price,     { prefix: '$' })} />
          <Row label="Day High"       value={fmt(data.day_high,       { prefix: '$' })} />
          <Row label="Day Low"        value={fmt(data.day_low,        { prefix: '$' })} />
        </section>

        {/* 52-Week Range */}
        <section className={styles.section}>
          <p className={styles.sectionTitle}>52-Week Range</p>
          <Row label="52W High" value={fmt(data.week_52_high, { prefix: '$' })} />
          <Row label="52W Low"  value={fmt(data.week_52_low,  { prefix: '$' })} />
        </section>

        {/* Volume & Market Cap */}
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Market</p>
          <Row label="Market Cap"    value={fmtLargeNum(data.market_cap)} />
          <Row label="Volume"        value={data.volume != null ? data.volume.toLocaleString() : 'N/A'} />
          <Row label="Avg Volume"    value={data.average_volume != null ? `${(data.average_volume).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : 'N/A'} />
        </section>

        {/* Fundamentals */}
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Fundamentals</p>
          <Row label="P/E Ratio"       value={fmt(data.pe_ratio,       { decimals: 2 })} />
          <Row label="EPS"             value={fmt(data.eps,            { prefix: '$', decimals: 2 })} />
          <Row label="Beta"            value={fmt(data.beta,           { decimals: 2 })} />
          <Row label="Dividend Yield"  value={data.dividend_yield != null ? fmt(data.dividend_yield, { suffix: '%', decimals: 2 }) : 'N/A'} />
        </section>
      </div>

      <p className={styles.note}>
        Data sourced from Finnhub · For informational purposes only
      </p>
    </div>
  );
}
