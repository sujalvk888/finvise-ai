export function getCurrencySymbol(currencyCode: string | null | undefined): string {
  if (!currencyCode) return '$';
  switch(currencyCode.toUpperCase()) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    default: return '$';
  }
}

export function formatCurrency(value: number | null | undefined, currencyCode: string | null | undefined, prefix: string = ''): string {
  if (value === null || value === undefined) return 'N/A';
  const sym = getCurrencySymbol(currencyCode);
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formattedNumber = absValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${isNegative ? '-' : ''}${prefix}${sym}${formattedNumber}`;
}

export function formatCompactCurrency(value: number | null | undefined, currencyCode: string | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  const sym = getCurrencySymbol(currencyCode);
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  
  let formattedStr = '';
  if (absValue >= 1e12) {
    formattedStr = `${(absValue / 1e12).toLocaleString('en-US', { maximumFractionDigits: 2 })}T`;
  } else if (absValue >= 1e9) {
    formattedStr = `${(absValue / 1e9).toLocaleString('en-US', { maximumFractionDigits: 2 })}B`;
  } else if (absValue >= 1e6) {
    formattedStr = `${(absValue / 1e6).toLocaleString('en-US', { maximumFractionDigits: 2 })}M`;
  } else {
    formattedStr = absValue.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  
  return `${isNegative ? '-' : ''}${sym}${formattedStr}`;
}
