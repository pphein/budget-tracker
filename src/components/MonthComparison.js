import React, { useMemo } from 'react';

const intlFmt = new Intl.NumberFormat();
const fmt     = (n) => intlFmt.format(Math.round(Math.abs(n)));
const pctDiff = (curr, prev) =>
  prev === 0 ? null : (((curr - prev) / prev) * 100).toFixed(0);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const MonthComparison = ({ transactions, filterYears, filterMonths }) => {
  const result = useMemo(() => {
    const filter = (years, months) =>
      transactions.filter((t) => {
        const d = new Date(t.date);
        if (years.length && !years.includes(d.getFullYear())) return false;
        if (months.length && !months.includes(d.getMonth() + 1)) return false;
        return true;
      });
    const sum = (txns, type) =>
      txns.filter((t) => t.type === type).reduce((s, t) => s + parseFloat(t.amount || 0), 0);

    let currTx, prevTx, currLabel, prevLabel;

    if (filterMonths.length === 1 && filterYears.length === 1) {
      const m = filterMonths[0], y = filterYears[0];
      const pm = m === 1 ? 12 : m - 1;
      const py = m === 1 ? y - 1 : y;
      currTx    = filter([y],  [m]);
      prevTx    = filter([py], [pm]);
      currLabel = `${MONTH_NAMES[m - 1]} ${y}`;
      prevLabel = `${MONTH_NAMES[pm - 1]} ${py}`;
    } else if (filterYears.length === 1 && filterMonths.length === 0) {
      const y = filterYears[0];
      currTx    = filter([y],     []);
      prevTx    = filter([y - 1], []);
      currLabel = String(y);
      prevLabel = String(y - 1);
    } else {
      return null;
    }

    const make = (txns) => {
      const income  = sum(txns, 'income');
      const expense = sum(txns, 'expense');
      return { income, expense, net: income - expense };
    };

    return { curr: make(currTx), prev: make(prevTx), currLabel, prevLabel };
  }, [transactions, filterYears, filterMonths]);

  if (!result) return null;
  const { curr, prev, currLabel, prevLabel } = result;

  const rows = [
    { label: 'Income',  cval: curr.income,  pval: prev.income,  good: (c, p) => c >= p },
    { label: 'Expense', cval: curr.expense, pval: prev.expense, good: (c, p) => c <= p },
    { label: 'Net',     cval: curr.net,     pval: prev.net,     good: (c, p) => c >= p },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
        Period Comparison
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left text-xs text-gray-400 dark:text-gray-500 pb-2 font-medium" />
            <th className="text-right text-xs text-gray-400 dark:text-gray-500 pb-2 font-medium">{currLabel}</th>
            <th className="text-right text-xs text-gray-400 dark:text-gray-500 pb-2 font-medium">{prevLabel}</th>
            <th className="text-right text-xs text-gray-400 dark:text-gray-500 pb-2 font-medium">Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, cval, pval, good }) => {
            const delta  = pctDiff(cval, pval);
            const isGood = good(cval, pval);
            const cColor = label === 'Income'  ? 'text-green-600 dark:text-green-400'
                         : label === 'Expense' ? 'text-red-600 dark:text-red-400'
                         : cval >= 0           ? 'text-[var(--primary-600)] dark:text-[var(--primary-400)]'
                         :                       'text-red-600 dark:text-red-400';
            return (
              <tr key={label} className="border-t border-gray-100 dark:border-gray-800">
                <td className="py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</td>
                <td className={`py-2 text-right font-semibold ${cColor}`}>{fmt(cval)}</td>
                <td className="py-2 text-right text-gray-400 dark:text-gray-500 text-xs">{fmt(pval)}</td>
                <td className="py-2 text-right">
                  {delta !== null ? (
                    <span className={`text-xs font-medium ${isGood ? 'text-green-500' : 'text-red-500'}`}>
                      {cval >= pval ? '▲' : '▼'}{Math.abs(delta)}%
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MonthComparison;
