'use client';

import React, { useRef, useState } from 'react';
import { useWatchlist } from '../../../dashboard/context/WatchlistContext';
import { ImportExportService } from '../../services/ImportExportService';
import { stockService } from '../../../dashboard/services/stockService';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import styles from '../../page.module.css';

interface Props {
  onAddClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function WatchlistHeader({ onAddClick, searchQuery, onSearchChange }: Props) {
  const { watchlist, addStock, forceRefresh, isRefreshing, clearWatchlist } = useWatchlist();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Modal states
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [importConfirmData, setImportConfirmData] = useState<{
    isOpen: boolean;
    message: string;
    newTickers: string[];
    totalSkipped: number;
    invalid: number;
  }>({ isOpen: false, message: '', newTickers: [], totalSkipped: 0, invalid: 0 });

  const handleExport = () => {
    ImportExportService.exportToCsv(watchlist);
    setShowMenu(false);
  };

  const handleClearClick = () => {
    setShowMenu(false);
    setIsClearModalOpen(true);
  };

  const confirmClear = () => {
    clearWatchlist();
  };

  const handleRefresh = () => {
    forceRefresh();
    setShowMenu(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { tickers, skipped, invalid } = await ImportExportService.parseImportFile(file);
      
      const existingTickers = new Set(watchlist.map(s => s.symbol));
      const newTickers = tickers.filter(t => !existingTickers.has(t));
      const totalSkipped = skipped + (tickers.length - newTickers.length);
      
      if (newTickers.length === 0) {
        setImportStatus(`No valid new stocks found. Skipped: ${totalSkipped}, Invalid: ${invalid}`);
        setTimeout(() => setImportStatus(null), 5000);
        return;
      }
      
      const confirmMessage = `Found ${newTickers.length} new valid stocks to import.\n\nSkipped (duplicates): ${totalSkipped}\nInvalid entries: ${invalid}\n\nDo you want to proceed and add these ${newTickers.length} stocks to your watchlist?`;
      
      setImportConfirmData({
        isOpen: true,
        message: confirmMessage,
        newTickers,
        totalSkipped,
        invalid
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Import failed', err);
      setImportStatus('Import failed. Please try again.');
      setTimeout(() => setImportStatus(null), 5000);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const executeImport = async () => {
    const { newTickers, totalSkipped, invalid } = importConfirmData;
    setImportStatus('Importing...');
    let added = 0;
    for (const ticker of newTickers) {
      try {
        const sd = await stockService.analyzeStock(ticker);
        addStock(sd);
        added++;
      } catch (err) {
        console.error(`Failed to analyze ${ticker}`, err);
      }
    }

    setImportStatus(`Imported: Added ${added}, Skipped ${totalSkipped}, Invalid ${invalid}`);
    setTimeout(() => setImportStatus(null), 5000);
  };

  return (
    <div className={styles.header}>
      <div className={styles.titleArea}>
        <h1>
          <svg className={styles.titleIcon} xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          My Watchlist
        </h1>
        <p className={styles.subtitle}>Track your favorite stocks and monitor their performance.</p>
        {importStatus && <p style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '8px' }}>{importStatus}</p>}
      </div>
      <div className={styles.actions}>
        <div style={{ position: 'relative', marginRight: '12px' }}>
          <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search watchlist..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>
        <button className={styles.addBtn} onClick={onAddClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Stock
        </button>
        
        <input 
          type="file" 
          accept=".csv" 
          style={{ display: 'none' }} 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button className={styles.importBtn} onClick={() => fileInputRef.current?.click()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Import Watchlist
        </button>
        
        <div style={{ position: 'relative' }}>
          <button 
            className={styles.moreBtn} 
            onClick={() => setShowMenu(!showMenu)}
            disabled={isRefreshing}
            style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isRefreshing ? (
               <span style={{ fontSize: '10px' }}>...</span>
            ) : (
               <span>&#8942;</span>
            )}
          </button>
          
          {showMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              padding: '8px',
              zIndex: 10,
              minWidth: '160px'
            }}>
              <button 
                onClick={handleRefresh}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: '0.9rem', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '4px', color: '#334155' }}
              >
                Refresh Watchlist
              </button>
              <button 
                onClick={handleExport}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: '0.9rem', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '4px', color: '#334155' }}
              >
                Export CSV
              </button>
              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }}></div>
              <button 
                onClick={handleClearClick}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: '0.9rem', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '4px', color: '#ef4444' }}
              >
                Clear Watchlist
              </button>
            </div>
          )}
        </div>
      </div>
      
      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={confirmClear}
        title="Clear Watchlist"
        message="Are you sure you want to clear your entire watchlist? This action cannot be undone."
        confirmText="Clear All"
      />

      <ConfirmModal
        isOpen={importConfirmData.isOpen}
        onClose={() => setImportConfirmData({ ...importConfirmData, isOpen: false })}
        onConfirm={executeImport}
        title="Confirm Import"
        message={importConfirmData.message}
        confirmText="Import Stocks"
      />
    </div>
  );
}
