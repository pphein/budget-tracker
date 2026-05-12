import React, { useRef } from 'react';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fmt = (n) => new Intl.NumberFormat().format(Math.round(Math.abs(n)));
const fmtC = (n) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const MonthlyReportModal = ({ isOpen, onClose, transactions, filterYears, filterMonths }) => {
  const printRef = useRef(null);

  if (!isOpen) return null;

  const now = new Date();
  const cy  = filterYears.length === 1 ? filterYears[0] : now.getFullYear();
  const cm  = filterMonths.length === 1 ? filterMonths[0] : now.getMonth() + 1;
  const ly  = cm === 1 ? cy - 1 : cy;
  const lm  = cm === 1 ? 12 : cm - 1;

  const monthName = new Date(cy, cm - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const inMonth = (iso, y, m) => {
    const d = new Date(iso);
    return d.getFullYear() === y && d.getMonth() + 1 === m;
  };

  const thisMonth = transactions.filter((t) => inMonth(t.date, cy, cm));
  const lastMonth = transactions.filter((t) => inMonth(t.date, ly, lm));

  const income  = thisMonth.filter((t) => t.type === 'income').reduce((s, t)  => s + parseFloat(t.amount || 0), 0);
  const expense = thisMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const net     = income - expense;
  const lastInc = lastMonth.filter((t) => t.type === 'income').reduce((s, t)  => s + parseFloat(t.amount || 0), 0);
  const lastExp = lastMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const savings = income > 0 ? ((net / income) * 100) : null;
  const txCount = thisMonth.length;

  // Tag breakdown
  const tagTotals = thisMonth
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => { acc[t.tag] = (acc[t.tag] || 0) + parseFloat(t.amount || 0); return acc; }, {});
  const topTags = Object.entries(tagTotals).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const pctChange = (cur, prev) => prev > 0 ? (((cur - prev) / prev) * 100).toFixed(1) : null;
  const expPct = pctChange(expense, lastExp);
  const incPct = pctChange(income, lastInc);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Report - ${monthName}</title>
      <style>
        body { font-family: sans-serif; padding: 24px; color: #111; }
        h1 { font-size: 20px; margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
        .label { font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
        .value { font-size: 18px; font-weight: bold; }
        .green { color: #16a34a; } .red { color: #dc2626; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #e5e7eb; padding: 6px 10px; text-align: left; font-size: 12px; }
        th { background: #f9fafb; font-weight: 600; }
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Monthly Report</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium">
              <PrinterIcon className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3" ref={printRef}>
          <h1 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-3">{monthName}</h1>

          {/* Summary grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Income</p>
              <p className="text-xl font-bold text-green-500">{fmt(income)}</p>
              {incPct !== null && <p className={`text-xs mt-0.5 ${parseFloat(incPct) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{incPct > 0 ? '+' : ''}{incPct}% vs last month</p>}
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Expenses</p>
              <p className="text-xl font-bold text-red-500">{fmt(expense)}</p>
              {expPct !== null && <p className={`text-xs mt-0.5 ${parseFloat(expPct) <= 0 ? 'text-green-500' : 'text-red-500'}`}>{expPct > 0 ? '+' : ''}{expPct}% vs last month</p>}
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Net</p>
              <p className={`text-xl font-bold ${net >= 0 ? 'text-[var(--primary-600)]' : 'text-red-500'}`}>{net >= 0 ? '' : '-'}{fmt(net)}</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Savings Rate</p>
              <p className={`text-xl font-bold ${savings !== null && savings >= 0 ? 'text-[var(--primary-600)]' : 'text-red-500'}`}>
                {savings !== null ? `${savings.toFixed(1)}%` : '—'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{txCount} transactions</p>
            </div>
          </div>

          {/* Top tags bar chart */}
          {topTags.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Top Expense Tags</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={topTags.map(([name, val]) => ({ name, val }))} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={fmtC} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                    {topTags.map((_, i) => <Cell key={i} fill="var(--primary-500)" fillOpacity={1 - i * 0.12} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Table */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-left">Tag</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right">Amount</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right">% of total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTags.map(([name, val]) => (
                      <tr key={name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-gray-700 dark:text-gray-300">{name}</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{fmt(val)}</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right text-gray-400">{expense > 0 ? ((val / expense) * 100).toFixed(1) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {thisMonth.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10">No transactions for this month.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportModal;
