import React, { useMemo } from 'react';
import { getRecurring } from '../utils/recurring';

const intlFmt = new Intl.NumberFormat();
const fmt = (n) => intlFmt.format(Math.round(n));

const RecurringVsOneOff = ({ transactions, filterYears, filterMonths }) => {
  const data = useMemo(() => {
    const rules = getRecurring();
    if (rules.length === 0) return null;

    const filtered = transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      if (filterYears.length && !filterYears.includes(d.getFullYear())) return false;
      if (filterMonths.length && !filterMonths.includes(d.getMonth() + 1)) return false;
      return true;
    });
    if (filtered.length === 0) return null;

    const recurringTags = new Set(rules.map((r) => r.tag));
    let fixed = 0, variable = 0;
    filtered.forEach((t) => {
      if (recurringTags.has(t.tag)) fixed += parseFloat(t.amount || 0);
      else variable += parseFloat(t.amount || 0);
    });

    const total = fixed + variable;
    if (total === 0) return null;
    return { fixed, variable, total, fixedPct: (fixed / total) * 100 };
  }, [transactions, filterYears, filterMonths]);

  if (!data) return null;
  const { fixed, variable, fixedPct } = data;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
        Fixed vs Variable Expenses
      </p>
      <div className="flex h-3 rounded-full overflow-hidden mb-3">
        <div
          className="bg-[var(--primary-400)] transition-all duration-500"
          style={{ width: `${fixedPct}%` }}
        />
        <div className="bg-orange-400 flex-1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[var(--primary-400)] flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Fixed (recurring)</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {fmt(fixed)} <span className="text-xs font-normal text-gray-400">({fixedPct.toFixed(0)}%)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-orange-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Variable</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {fmt(variable)} <span className="text-xs font-normal text-gray-400">({(100 - fixedPct).toFixed(0)}%)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringVsOneOff;
