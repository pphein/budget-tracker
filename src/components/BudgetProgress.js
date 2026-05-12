import React from 'react';

const fmt = (n) => new Intl.NumberFormat().format(Math.round(n));

const BudgetProgress = ({ expenseByTag, limits }) => {
  const entries = Object.entries(limits).filter(([, lim]) => lim > 0);
  if (entries.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-3">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Budget Limits
      </h3>
      <div className="space-y-3">
        {entries.map(([tag, limit]) => {
          const spent = expenseByTag[tag] || 0;
          const pct   = Math.min((spent / limit) * 100, 100);
          const over  = spent > limit;
          const warn  = !over && pct >= 80;
          return (
            <div key={tag}>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm text-gray-700 dark:text-gray-200">{tag}</span>
                <span className={`text-xs font-medium ${over ? 'text-red-500' : warn ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
                  {fmt(spent)} / {fmt(limit)}
                  {over && ' (over!)'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    over ? 'bg-red-500' : warn ? 'bg-orange-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetProgress;
