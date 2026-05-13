import React, { useMemo } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const intlFmt = new Intl.NumberFormat();
const fmt = (n) => intlFmt.format(Math.round(n));

const IncomeStabilityCard = ({ transactions }) => {
  const data = useMemo(() => {
    const now    = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year:  d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
      });
    }

    const monthly = months.map(({ year, month, label }) => {
      const income = transactions
        .filter((t) => {
          if (t.type !== 'income') return false;
          const d = new Date(t.date);
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        })
        .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
      return { year, month, label, income };
    });

    const withData = monthly.filter((m) => m.income > 0);
    if (withData.length < 3) return null;

    const avg  = withData.reduce((s, m) => s + m.income, 0) / withData.length;
    const max  = Math.max(...monthly.map((m) => m.income));
    const flags = monthly.filter((m) => m.income > 0 && m.income < avg * 0.8);

    const last = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    const trend = prev.income > 0 ? ((last.income - prev.income) / prev.income) * 100 : null;

    return { monthly, avg, max, flags, trend, last };
  }, [transactions]);

  if (!data) return null;

  const { monthly, avg, max, flags, trend, last } = data;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Income Stability (6 mo)
        </p>
        {flags.length > 0 && (
          <div className="flex items-center gap-1 text-amber-500">
            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{flags.length} dip{flags.length > 1 ? 's' : ''} detected</span>
          </div>
        )}
      </div>

      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-12 mb-1">
        {monthly.map(({ year, month, income }) => {
          const h         = max > 0 ? (income / max) * 100 : 0;
          const isFlagged = flags.some((f) => f.year === year && f.month === month);
          return (
            <div key={`${year}-${month}`} className="flex-1 flex items-end" style={{ height: '100%' }}>
              <div
                className={`w-full rounded-t transition-all duration-500 ${isFlagged ? 'bg-amber-400 dark:bg-amber-500' : 'bg-green-400 dark:bg-green-500'}`}
                style={{ height: `${h}%`, minHeight: income > 0 ? '4px' : '0' }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mb-3">
        {monthly.map(({ year, month, label }) => (
          <div key={`${year}-${month}`} className="flex-1 text-center text-xs text-gray-400 dark:text-gray-500">
            {label}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>6-mo avg: {fmt(avg)}</span>
        {trend !== null && last.income > 0 && (
          <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(0)}% vs last mo
          </span>
        )}
      </div>
    </div>
  );
};

export default IncomeStabilityCard;
