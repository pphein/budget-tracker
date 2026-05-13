import React, { useMemo } from 'react';
import { getTagColorClasses } from '../utils/tagColors';

const intlFmt = new Intl.NumberFormat();
const fmt = (n) => intlFmt.format(Math.round(n));

const TopSpendingTags = ({ transactions, allTags, filterYears, filterMonths }) => {
  const items = useMemo(() => {
    const filtered = transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      if (filterYears.length && !filterYears.includes(d.getFullYear())) return false;
      if (filterMonths.length && !filterMonths.includes(d.getMonth() + 1)) return false;
      return true;
    });

    const map = {};
    filtered.forEach((t) => {
      map[t.tag] = (map[t.tag] || 0) + parseFloat(t.amount || 0);
    });

    const total = Object.values(map).reduce((s, v) => s + v, 0);

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([tag, amount]) => ({ tag, amount, pctOfTotal: total > 0 ? (amount / total) * 100 : 0 }));
  }, [transactions, filterYears, filterMonths]);

  if (items.length === 0) return null;

  const max = items[0].amount;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
        Top Spending Tags
      </p>
      <div className="space-y-3">
        {items.map(({ tag, amount, pctOfTotal }, i) => {
          const tagObj = allTags.find((t) => t.name === tag);
          const colors = tagObj ? getTagColorClasses(tagObj.colorIndex) : null;
          const barW   = max > 0 ? (amount / max) * 100 : 0;
          return (
            <div key={tag}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500 w-4 text-right">{i + 1}</span>
                  {colors ? (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {tag}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-700 dark:text-gray-300">{tag}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{pctOfTotal.toFixed(0)}%</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{fmt(amount)}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors ? colors.dot : 'bg-red-400'}`}
                  style={{ width: `${barW}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopSpendingTags;
