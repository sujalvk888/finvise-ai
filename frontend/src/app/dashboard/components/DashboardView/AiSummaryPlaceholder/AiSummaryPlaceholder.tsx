'use client';

import { useState, useEffect, useRef } from 'react';
import { stockService } from '../../../services/stockService';
import { AiReport } from '../../../types/stock';
import { useWatchlist } from '../../../context/WatchlistContext';
import { useDashboardContext } from '../../../context/DashboardContext';
import styles from './AiSummaryPlaceholder.module.css';

interface Props {
  ticker?: string;
  engine?: string;
  onSummaryReady?: (summary: string | null) => void;
}

const VERDICT_COLORS: Record<string, string> = {
  'Strong Buy': '#16a34a',
  'Buy': '#22c55e',
  'Hold': '#f59e0b',
  'Reduce': '#f97316',
  'Sell': '#ef4444',
};

/** Rotating messages shown during a refresh. */
const REFRESH_MESSAGES = [
  'Fetching the latest financial data...',
  'Evaluating company fundamentals...',
  'Generating a new investment report...',
  'Finalizing AI insights...',
];

export default function AiSummaryPanel({ ticker, engine = 'groq', onSummaryReady }: Props) {
  const { cachedAnalysis, setActiveAiReport, saveCurrentAnalysis, isRefreshingFlag } = useDashboardContext();
  const [report, setReport] = useState<AiReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // During a refresh, we hold the previous report here so we can restore on failure
  const [previousReport, setPreviousReport] = useState<AiReport | null>(null);
  // Shown after a failed refresh where we restored the previous report
  const [restoreNotice, setRestoreNotice] = useState(false);
  // Index into REFRESH_MESSAGES for rotation
  const [msgIdx, setMsgIdx] = useState(0);

  const { isStockInWatchlist, updateAiVerdict } = useWatchlist();

  // Cache: avoid re-fetching when engine or ticker hasn't changed
  const cacheRef = useRef<{ ticker: string; engine: string; report: AiReport } | null>(null);

  // Rotate loading messages every 2.5 s while loading during a refresh
  useEffect(() => {
    if (!loading || !isRefreshingFlag) {
      const reset = setTimeout(() => setMsgIdx(0), 0);
      return () => clearTimeout(reset);
    }
    const interval = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % REFRESH_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading, isRefreshingFlag]);

  useEffect(() => {
    setActiveAiReport(report);
  }, [report, setActiveAiReport]);

  // When all pieces of the analysis are ready, save to localStorage
  useEffect(() => {
    if (ticker && report && !loading && !error) {
      // Always save after a refresh; otherwise only save if this is genuinely new
      if (isRefreshingFlag || !cachedAnalysis || cachedAnalysis.engine !== engine) {
        saveCurrentAnalysis(ticker, engine);
      }
    }
  }, [ticker, engine, report, loading, error, cachedAnalysis, isRefreshingFlag, saveCurrentAnalysis]);

  useEffect(() => {
    if (!ticker) return;

    let mounted = true;
    const cacheKey = `finvise_ai_report_${ticker}_${engine}`;

    const fetchReport = async () => {
      if (isRefreshingFlag) {
        if (mounted) {
          // Stash the current report so we can restore it on failure
          setPreviousReport(report);
          setRestoreNotice(false);
          setReport(null);
          setLoading(true);
        }
      }

      // --- Cache checks (skip entirely when refreshing) ---
      if (!isRefreshingFlag) {
        // 1. Context-level cached analysis
        if (cachedAnalysis && cachedAnalysis.engine === engine) {
          if (mounted) {
            setReport(cachedAnalysis.aiReport);
            setLoading(false);
            if (onSummaryReady && cachedAnalysis.aiReport.company_summary) {
              onSummaryReady(cachedAnalysis.aiReport.company_summary);
            }
          }
          return;
        }

        // 2. In-memory cache
        if (
          cacheRef.current &&
          cacheRef.current.ticker === ticker &&
          cacheRef.current.engine === engine
        ) {
          if (mounted) {
            setReport(cacheRef.current.report);
            setLoading(false);
            if (onSummaryReady && cacheRef.current.report.company_summary) {
              onSummaryReady(cacheRef.current.report.company_summary);
            }
          }
          return;
        }

        // 3. sessionStorage
        try {
          const stored = sessionStorage.getItem(cacheKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (mounted) {
              setReport(parsed);
              cacheRef.current = { ticker, engine, report: parsed };
              setLoading(false);
              if (onSummaryReady && parsed.company_summary) {
                onSummaryReady(parsed.company_summary);
              }
            }
            return;
          }
        } catch {}
      }

      // --- Live fetch ---
      setLoading(true);
      setError(null);
      if (onSummaryReady) onSummaryReady(null);

      try {
        const result = await stockService.getAiAnalysis(ticker, engine);
        if (mounted) {
          setReport(result);
          setPreviousReport(null); // no longer needed
          cacheRef.current = { ticker, engine, report: result };
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(result));
          } catch {}

          if (isStockInWatchlist(ticker)) {
            const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            updateAiVerdict(ticker, result.verdict_label, engine, timeStr);
          }

          if (onSummaryReady && result.company_summary) {
            onSummaryReady(result.company_summary);
          }
        }
      } catch (err: unknown) {
        if (mounted) {
          if (isRefreshingFlag && previousReport) {
            // Restore the old report instead of leaving the panel empty
            setReport(previousReport);
            setRestoreNotice(true);
            // Auto-dismiss the notice after 6 s
            setTimeout(() => { if (mounted) setRestoreNotice(false); }, 6000);
          } else {
            console.error('AI Analysis failed:', err);
            const msg = err instanceof Error ? err.message : 'Unable to generate AI analysis at this time.';
            setError(msg);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReport();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, engine, onSummaryReady, cachedAnalysis, isRefreshingFlag]);

  const engineLabel = engine === 'ollama' ? 'Ollama / phi3:mini' : 'Groq / Llama 3.3 70B';

  if (!ticker) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <RobotIcon />
            <h3 className={styles.title}>FinVise AI Advisory Report</h3>
          </div>
          <div className={styles.badge}><span className={styles.enginePrefix}>Engine:</span> {engineLabel}</div>
        </div>
        <div className={styles.emptyState}>
          <p>Search a stock to generate an AI-powered financial analysis.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <RobotIcon />
            <h3 className={styles.title}>FinVise AI Advisory Report</h3>
          </div>
          <div className={styles.badge}><span className={styles.enginePrefix}>Engine:</span> {engineLabel}</div>
        </div>
        <div className={styles.refreshLoadingContainer}>
          {/* Animated ring */}
          <div className={styles.refreshRingWrapper}>
            <div className={styles.refreshRingOuter} />
            <div className={styles.refreshRingInner} />
            <div className={styles.refreshRingIcon}>
              <RobotIcon />
            </div>
          </div>

          <p className={styles.refreshHeadline}>
            {isRefreshingFlag ? 'Refreshing your AI analysis...' : <>Generating AI analysis for <strong>{ticker}</strong>...</>}
          </p>

          {isRefreshingFlag && (
            <p className={styles.refreshSubMessage}>
              {REFRESH_MESSAGES[msgIdx]}
            </p>
          )}

          {/* Animated skeleton lines */}
          <div className={styles.refreshSkeletons}>
            <div className={styles.skeletonLine} style={{ width: '88%' }} />
            <div className={styles.skeletonLine} style={{ width: '72%' }} />
            <div className={styles.skeletonLine} style={{ width: '82%' }} />
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
            <div className={styles.skeletonLine} style={{ width: '78%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <RobotIcon />
            <h3 className={styles.title}>FinVise AI Advisory Report</h3>
          </div>
          <div className={styles.badge}><span className={styles.enginePrefix}>Engine:</span> {engineLabel}</div>
        </div>
        <div className={styles.errorState}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const verdictColor = VERDICT_COLORS[report.verdict_label] || '#f59e0b';

  return (
    <div className={styles.card}>
      {/* Restore notice — shown when a refresh failed and the old report was put back */}
      {restoreNotice && (
        <div className={styles.restoreNotice}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Unable to refresh the analysis. The previous report has been restored.</span>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.titleArea}>
          <RobotIcon />
          <h3 className={styles.title}>FinVise AI Advisory Report</h3>
        </div>
        <div className={styles.badge}>Engine: {engineLabel}</div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#22c55e" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="16 12 12 8 8 12"></polyline>
              <line x1="12" y1="16" x2="12" y2="8"></line>
            </svg>
            <span>Strengths</span>
          </div>
          <ul className={styles.list}>
            {Array.isArray(report.strengths) 
              ? report.strengths.map((s, i) => <li key={i}>{s}</li>)
              : <li>{String(report.strengths || 'No strengths provided.')}</li>}
          </ul>
        </div>

        {/* Risks */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span>Risks</span>
          </div>
          <ul className={styles.list}>
            {Array.isArray(report.risks)
              ? report.risks.map((r, i) => <li key={i}>{r}</li>)
              : <li>{String(report.risks || 'No risks provided.')}</li>}
          </ul>
        </div>

        {/* Verdict */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Verdict</span>
          </div>
          <div className={styles.verdictBadge} style={{ backgroundColor: `${verdictColor}18`, color: verdictColor, borderColor: `${verdictColor}40` }}>
            {report.verdict_label}
          </div>
          <p className={styles.verdictText}>{report.verdict_text}</p>
        </div>
      </div>

      <div className={styles.disclaimerBox}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <polyline points="9 12 11 14 15 10"></polyline>
        </svg>
        <p>This analysis is generated using AI models and real-time market data. Please verify independently before investing.</p>
      </div>
    </div>
  );
}

function RobotIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2ab6da" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"></rect>
      <circle cx="12" cy="5" r="2"></circle>
      <path d="M12 7v4"></path>
      <line x1="8" y1="16" x2="8" y2="16"></line>
      <line x1="16" y1="16" x2="16" y2="16"></line>
    </svg>
  );
}

