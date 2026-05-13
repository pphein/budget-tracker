import React, { useMemo } from 'react';

const intlFmt = new Intl.NumberFormat();
const fmt = (n) => intlFmt.format(Math.round(n));

const BudgetForecast = ({ transactions, filterYears, filterMonths, budgetLimits }) => {
  const data = useMemo(() => {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;

    if (filterYears.length !== 1 || filterYears[0] !== year) return null;
    if (filterMonths.length !== 1 || filterMonths[0] !== month) return null;

    const daysInMonth = new Date(year, month, 0).getDate();
    const elapsed     = now.getDate();

    const monthTx = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    const income     = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const expense    = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const projected  = elapsed > 0 ? (expense / elapsed) * daysInMonth : 0;
    const totalLimit = Object.values(budgetLimits).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const remaining  = income - expense;

    return { income, expense, projected, daysInMonth, elapsed, totalLimit, remaining };
  }, [transactions, filterYears, filterMonths, budgetLimits]);

  if (!data) return null;

  const { income, expense, projected, daysInMonth, elapsed, totalLimit, remaining } = data;
  const overPace = totalLimit > 0 && projected > totalLimit;
  const dayPct   = daysInMonth > 0 ? (elapsed / daysInMonth) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm flex-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
        Month Forecast — Day {elapsed}/{daysInMonth}
      </p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Spent so far</p>
          <p className="text-base font-bold text-red-600 dark:text-red-400">{fmt(expense)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Projected total</p>
          <p className={`text-base font-bold ${overPace ? 'text-red-600 dark:text-red-400' : 'text-[var(--primary-600)] dark:text-[var(--primary-400)]'}`}>
            {fmt(projected)} {overPace && <span className="text-xs">⚠️</span>}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Remaining</p>
          <p className={`text-base font-bold ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {fmt(remaining)}
          </p>
        </div>
        {totalLimit > 0 && (
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Budget limit</p>
            <p className="text-base font-bold text-gray-700 dark:text-gray-300">{fmt(totalLimit)}</p>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Month progress</p>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-[var(--primary-400)] rounded-full transition-all duration-500" style={{ width: `${dayPct}%` }} />
        </div>
      </div>
    </div>
  );
};

export default BudgetForecast;
