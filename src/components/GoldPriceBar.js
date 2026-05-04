import React from 'react';

const fmt = (n) => new Intl.NumberFormat().format(n);

const GoldPriceBar = ({ worldPrice, myanmarPrice, updatedAt }) => {
  if (!worldPrice && !myanmarPrice) return null;

  const dateLabel = updatedAt
    ? new Date(updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  return (
    <div className="px-2 sm:px-4 max-w-6xl mx-auto mt-2">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          {worldPrice && (
            <span className="flex items-baseline gap-1">
              <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-500">World</span>
              <span className="text-sm font-bold text-yellow-800 dark:text-yellow-300">${fmt(worldPrice)}</span>
              <span className="text-xs text-yellow-600 dark:text-yellow-500">/oz</span>
            </span>
          )}
          {worldPrice && myanmarPrice && (
            <span className="text-yellow-300 dark:text-yellow-700">·</span>
          )}
          {myanmarPrice && (
            <span className="flex items-baseline gap-1">
              <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-500">Myanmar</span>
              <span className="text-sm font-bold text-yellow-800 dark:text-yellow-300">{fmt(myanmarPrice)}</span>
              <span className="text-xs text-yellow-600 dark:text-yellow-500">/ကျပ်</span>
            </span>
          )}
        </div>
        {dateLabel && (
          <span className="text-xs text-yellow-500 dark:text-yellow-600 flex-shrink-0">{dateLabel}</span>
        )}
      </div>
    </div>
  );
};

export default GoldPriceBar;
