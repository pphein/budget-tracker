import React from 'react';

// Currencies to display — all rates are per 1 USD
const PAIRS = [
  { code: 'MMK', flag: '🇲🇲', decimals: 0 },
  { code: 'SGD', flag: '🇸🇬', decimals: 4 },
  { code: 'THB', flag: '🇹🇭', decimals: 2 },
  { code: 'EUR', flag: '🇪🇺', decimals: 4 },
  { code: 'GBP', flag: '🇬🇧', decimals: 4 },
  { code: 'JPY', flag: '🇯🇵', decimals: 2 },
  { code: 'CNY', flag: '🇨🇳', decimals: 4 },
  { code: 'KRW', flag: '🇰🇷', decimals: 0 },
  { code: 'AUD', flag: '🇦🇺', decimals: 4 },
];

const fmt = (n, decimals) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

const ExchangeRateBar = ({ rates, updatedAt, loading }) => {
  if (!rates && !loading) return null;

  const dateLabel = updatedAt
    ? new Date(updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="px-2 sm:px-4 max-w-6xl mx-auto mt-2">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl px-4 py-2.5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">1 USD =</span>
          {dateLabel && (
            <span className="text-xs text-blue-400 dark:text-blue-600">{dateLabel}</span>
          )}
        </div>

        {loading && !rates ? (
          <div className="flex gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-5 w-20 bg-blue-100 dark:bg-blue-800/40 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          /* Horizontally scrollable rates */
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-0.5">
            {PAIRS.map(({ code, flag, decimals }) => {
              const rate = rates?.[code];
              if (!rate) return null;
              return (
                <span key={code} className="flex items-baseline gap-1 flex-shrink-0">
                  <span className="text-sm">{flag}</span>
                  <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
                    {fmt(rate, decimals)}
                  </span>
                  <span className="text-xs text-blue-500 dark:text-blue-500">{code}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeRateBar;
