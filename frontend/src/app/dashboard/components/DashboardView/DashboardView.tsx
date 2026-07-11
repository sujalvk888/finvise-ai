'use client';

import { useState } from 'react';
import { StockData, HistoricalDataPoint } from '../../types/stock';
import CompanyOverviewCard from './CompanyOverviewCard/CompanyOverviewCard';
import FinancialMetricCards from './FinancialMetricCards/FinancialMetricCards';
import ChartPlaceholder from './ChartPlaceholder/ChartPlaceholder';
import AiSummaryPanel from './AiSummaryPlaceholder/AiSummaryPlaceholder';
import { useAiEngine } from '../../context/AiEngineContext';
import styles from './DashboardView.module.css';

interface DashboardViewProps {
  data: StockData;
}

export default function DashboardView({ data }: DashboardViewProps) {
  const { engine } = useAiEngine();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[] | null>(null);
  const [isHistoricalLoading, setIsHistoricalLoading] = useState(false);

  return (
    <div className={styles.dashboardContainer}>
      <CompanyOverviewCard data={data} aiSummary={aiSummary} />
      <FinancialMetricCards data={data} historicalData={historicalData} isLoading={isHistoricalLoading} />
      
      <div className={styles.bottomRow}>
        <div className={styles.chartWrapper}>
          <ChartPlaceholder 
            ticker={data.symbol} 
            currency={data.currency}
            onDataLoaded={setHistoricalData}
            onLoadingChange={setIsHistoricalLoading}
          />
        </div>
        <div className={styles.aiWrapper}>
          <AiSummaryPanel ticker={data.symbol} engine={engine} onSummaryReady={setAiSummary} />
        </div>
      </div>
      
      <div className={styles.disclaimer}>
        <div className={styles.disclaimerIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
        </div>
        <p>Disclaimer: FinVise.AI processes public algorithms and data sheets. Not certified financial advice.</p>
      </div>
    </div>
  );
}

