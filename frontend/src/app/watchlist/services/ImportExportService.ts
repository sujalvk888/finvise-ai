import { WatchlistStock } from '../../dashboard/types/watchlist';

export const ImportExportService = {
  exportToCsv(watchlist: WatchlistStock[]) {
    if (watchlist.length === 0) return;

    // Headers
    const headers = ['Symbol', 'Company', 'Sector', 'Price', 'Change (1D)', 'Market Cap', 'AI Verdict', 'Market Status', 'Last Updated'];
    
    // Rows
    const rows = watchlist.map(stock => [
      stock.symbol,
      `"${stock.company}"`,
      `"${stock.sector}"`,
      stock.price,
      `"${stock.change} (${stock.changePercent})"`,
      stock.marketCap,
      stock.aiVerdict,
      stock.marketStatus,
      stock.lastUpdated
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finvise_watchlist_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async parseImportFile(file: File): Promise<{ tickers: string[], skipped: number, invalid: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          reject(new Error('Failed to read file'));
          return;
        }

        const lines = text.split('\n');
        const validTickers = new Set<string>();
        let invalid = 0;
        let skipped = 0; // Duplicates within the file itself

        // Basic Regex for valid ticker (A-Z, 1-5 chars, optional dot/dash)
        const tickerRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/;

        // Skip header row if it exists
        const startIdx = lines[0].toLowerCase().includes('symbol') || lines[0].toLowerCase().includes('ticker') ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split by comma
          const cols = line.split(',');
          // Usually first column is symbol, strip quotes
          const rawTicker = cols[0].replace(/["']/g, '').trim().toUpperCase();

          if (tickerRegex.test(rawTicker)) {
            if (validTickers.has(rawTicker)) {
              skipped++;
            } else {
              validTickers.add(rawTicker);
            }
          } else {
            invalid++;
          }
        }

        resolve({ tickers: Array.from(validTickers), skipped, invalid });
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
};
