import React, { useMemo } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

const SavingsRateCard = ({ transactions, filterYears, filterMonths }) => {
  const { rate, diff, income, expense } = useMemo(() => {
    const filter = (years, months) =>
      transactions.filter((t) => {
        const d = new Date(t.date);
        if (years.length && !years.includes(d.getFullYear())) return false;
        if (months.length && !months.includes(d.getMonth() + 1)) return false;
        return true;
      });

    const sum = (txns, type) =>
      txns.filter((t) => t.type === type).reduce((s, t) => s + parseFloat(t.amount || 0), 0);

    const curr = filter(filterYears, filterMonths);
    const income  = sum(curr, 'income');
    const expense = sum(curr, 'expense');
    const rate    = income > 0 ? ((income - expense) / income) * 100 : null;

    // Previous period
    let prevYears = filterYears, prevMonths = filterMonths;
    if (filterMonths.length === 1 && filterYears.length === 1) {
      let m = filterMonths[0] - 1, y = filterYears[0];
      if (m === 0) { m = 12; y -= 1; }
      prevMonths = [m]; prevYears = [y];
    } else if (filterYears.length === 1 && filterMonths.length === 0) {
      prevYears = [filterYears[0] - 1]; prevMonths = [];
    }
    const prev     = filter(prevYears, prevMonths);
    const pIncome  = sum(prev, 'income');
    const pExpense = sum(prev, 'expense');
    const prevRate = pIncome > 0 ? ((pIncome - pExpense) / pIncome) * 100 : null;
    const diff     = rate !== null && prevRate !== null ? rate - prevRate : null;

    return { rate, diff, income, expense };
  }, [transactions, filterYears, filterMonths]);

  if (rate === null) return null;

  const color    = rate >= 20 ? 'text-green-600 dark:text-green-400'
                 : rate >= 0  ? 'text-yellow-600 dark:text-yellow-400'
                 :              'text-red-600 dark:text-red-400';
  const barColor = rate >= 20 ? 'bg-green-500' : rate >= 0 ? 'bg-yellow-500' : 'bg-red-500';
  const label    = rate >= 20 ? 'Great savings habit!'
                 : rate >= 0  ? 'Saving, but could be higher'
                 :              'Spending exceeds income';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm flex-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Savings Rate
        </p>
        {diff !== null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {diff >= 0
              ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
              : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
            {Math.abs(diff).toFixed(1)}% vs prev
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold ${color}`}>
        {rate.toFixed(1)}<span className="text-lg font-medium">%</span>
      </p>
      <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(Math.abs(rate), 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">{label}</p>
    </div>
  );
};

export default SavingsRateCard;
