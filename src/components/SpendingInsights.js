import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

const fmt = (n) => new Intl.NumberFormat().format(Math.round(n));

const monthLabel = (y, m) =>
  new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

const SpendingInsights = ({ transactions }) => {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const ly = cm === 1 ? cy - 1 : cy;
  const lm = cm === 1 ? 12 : cm - 1;

  const inMonth = (iso, y, m) => {
    const d = new Date(iso);
    return d.getFullYear() === y && d.getMonth() + 1 === m;
  };

  const sum = (arr) => arr.reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  const thisExp = transactions.filter((t) => t.type === 'expense' && inMonth(t.date, cy, cm));
  const lastExp = transactions.filter((t) => t.type === 'expense' && inMonth(t.date, ly, lm));
  const thisInc = transactions.filter((t) => t.type === 'income'  && inMonth(t.date, cy, cm));
  const lastInc = transactions.filter((t) => t.type === 'income'  && inMonth(t.date, ly, lm));

  const expTotal = sum(thisExp);
  const lastExpT = sum(lastExp);
  const incTotal = sum(thisInc);
  const lastIncT = sum(lastInc);

  const pct = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);
  const expPct = pct(expTotal, lastExpT);
  const incPct = pct(incTotal, lastIncT);

  const tagTotals = thisExp.reduce((acc, t) => {
    acc[t.tag] = (acc[t.tag] || 0) + parseFloat(t.amount || 0);
    return acc;
  }, {});
  const topTag = Object.entries(tagTotals).sort((a, b) => b[1] - a[1])[0];
  const savings = incTotal > 0 ? ((incTotal - expTotal) / incTotal) * 100 : null;

  if (thisExp.length === 0 && thisInc.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-3">
      <h3 className="text-sm font-semibold text-[var(--primary-600)] dark:text-[var(--primary-400)] mb-3">
        Spending Insights · {monthLabel(cy, cm)}
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Expenses</p>
          <p className="text-xl font-bold text-red-500">{fmt(expTotal)}</p>
          {expPct !== null && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${expPct > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {expPct > 0
                ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
              {Math.abs(expPct).toFixed(1)}% vs {monthLabel(ly, lm)}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Income</p>
          <p className="text-xl font-bold text-green-500">{fmt(incTotal)}</p>
          {incPct !== null && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${incPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {incPct >= 0
                ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
              {Math.abs(incPct).toFixed(1)}% vs {monthLabel(ly, lm)}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {topTag && (
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <span className="text-xs text-gray-500 dark:text-gray-400">Top expense</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{topTag[0]}</span>
              <span className="text-xs font-bold text-red-500">{fmt(topTag[1])}</span>
            </div>
          </div>
        )}
        {savings !== null && (
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <span className="text-xs text-gray-500 dark:text-gray-400">Savings rate</span>
            <span className={`text-xs font-bold ${savings >= 0 ? 'text-[var(--primary-600)] dark:text-[var(--primary-400)]' : 'text-red-500'}`}>
              {savings.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingInsights;
