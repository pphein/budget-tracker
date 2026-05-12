import React, { useState, useRef } from 'react';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fmt  = (n) => new Intl.NumberFormat().format(Math.round(Math.abs(n)));
const fmtC = (n) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const pctChange = (cur, prev) => prev > 0 ? (((cur - prev) / prev) * 100).toFixed(1) : null;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Section = ({ title }) => (
  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 mt-4">{title}</p>
);

const MonthlyReportModal = ({ isOpen, onClose, transactions, filterYears, filterMonths }) => {
  const printRef = useRef(null);
  const [trendTag, setTrendTag] = useState('');

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

  // ── Spending Insights ────────────────────────────────────────────────────
  const income  = thisMonth.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const expense = thisMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const net     = income - expense;
  const lastInc = lastMonth.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const lastExp = lastMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const savings = income > 0 ? ((net / income) * 100) : null;
  const txCount = thisMonth.length;
  const incPct  = pctChange(income, lastInc);
  const expPct  = pctChange(expense, lastExp);

  // Tag breakdown
  const tagTotals = thisMonth
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => { acc[t.tag] = (acc[t.tag] || 0) + parseFloat(t.amount || 0); return acc; }, {});
  const topTags = Object.entries(tagTotals).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topExpTag = topTags[0]?.[0] || '—';

  // ── Habits ───────────────────────────────────────────────────────────────
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
  const last30 = transactions.filter((t) => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo);
  const avgDailySpend = last30.reduce((s, t) => s + parseFloat(t.amount || 0), 0) / 30;

  // Saving streak: consecutive months with net > 0
  let streak = 0;
  for (let i = 0; i < 12; i++) {
    let y = cy, m = cm - i;
    while (m <= 0) { m += 12; y -= 1; }
    const inc = transactions.filter((t) => t.type === 'income' && inMonth(t.date, y, m)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const exp = transactions.filter((t) => t.type === 'expense' && inMonth(t.date, y, m)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    if (inc - exp > 0) streak++; else break;
  }

  // Highest spend day of week (last 90 days)
  const ninetyAgo = new Date(now); ninetyAgo.setDate(now.getDate() - 90);
  const dayTotals = Array(7).fill(0);
  transactions.filter((t) => t.type === 'expense' && new Date(t.date) >= ninetyAgo).forEach((t) => {
    dayTotals[new Date(t.date).getDay()] += parseFloat(t.amount || 0);
  });
  const peakDayIdx = dayTotals.indexOf(Math.max(...dayTotals));
  const peakDay = Math.max(...dayTotals) > 0 ? DAY_NAMES[peakDayIdx] : '—';

  // Best saving month (last 12)
  let bestSavingMonth = '—';
  let bestNet = -Infinity;
  for (let i = 0; i < 12; i++) {
    let y = cy, m = cm - i;
    while (m <= 0) { m += 12; y -= 1; }
    const inc = transactions.filter((t) => t.type === 'income'  && inMonth(t.date, y, m)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const exp = transactions.filter((t) => t.type === 'expense' && inMonth(t.date, y, m)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const n = inc - exp;
    if (n > bestNet) { bestNet = n; bestSavingMonth = new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); }
  }

  // ── Tag trend (last 12 months) ────────────────────────────────────────────
  const expenseTags = [...new Set(transactions.filter((t) => t.type === 'expense').map((t) => t.tag))].sort();
  const activeTrendTag = trendTag || expenseTags[0] || '';
  const trendData = Array.from({ length: 12 }, (_, i) => {
    let y = cy, m = cm - (11 - i);
    while (m <= 0) { m += 12; y -= 1; }
    const total = transactions
      .filter((t) => t.type === 'expense' && t.tag === activeTrendTag && inMonth(t.date, y, m))
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    return { month: MONTH_LABELS[m - 1], total };
  });

  // ── Balance table (last 12 months) ───────────────────────────────────────
  const balanceRows = Array.from({ length: 12 }, (_, i) => {
    let y = cy, m = cm - (11 - i);
    while (m <= 0) { m += 12; y -= 1; }
    const inc = transactions.filter((t) => t.type === 'income'  && inMonth(t.date, y, m)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const exp = transactions.filter((t) => t.type === 'expense' && inMonth(t.date, y, m)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    return { label: new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), income: inc, expense: exp, net: inc - exp };
  }).filter((r) => r.income > 0 || r.expense > 0);
  let carryOver = 0;

  // ── Print handler ─────────────────────────────────────────────────────────
  const handlePrint = () => {
    const content = printRef.current?.innerHTML || '';
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Report — ${monthName}</title>
      <style>
        body { font-family: sans-serif; padding: 24px; color: #111; font-size: 13px; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; margin: 16px 0 8px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
        .label { font-size: 11px; color: #9ca3af; margin-bottom: 3px; }
        .val { font-size: 17px; font-weight: 700; }
        .green { color: #16a34a; } .red { color: #dc2626; } .primary { color: #2563eb; }
        .sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 5px 8px; }
        th { background: #f9fafb; font-weight: 600; text-align: left; }
        td.r { text-align: right; }
        .habits { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .hitem { font-size: 12px; }
        .hlabel { color: #9ca3af; font-size: 11px; }
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Report</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium">
              <PrinterIcon className="w-4 h-4" /> Print / PDF
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3" ref={printRef}>
          <h1 className="text-base font-bold text-gray-700 dark:text-gray-200">{monthName}</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{txCount} transaction{txCount !== 1 ? 's' : ''}</p>

          {/* ── Spending Insights ── */}
          <Section title="Spending Insights" />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Income</p>
              <p className="text-lg font-bold text-green-500">{fmt(income)}</p>
              {incPct !== null && <p className={`text-xs mt-0.5 ${parseFloat(incPct) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{incPct > 0 ? '+' : ''}{incPct}% vs prev</p>}
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Expense</p>
              <p className="text-lg font-bold text-red-500">{fmt(expense)}</p>
              {expPct !== null && <p className={`text-xs mt-0.5 ${parseFloat(expPct) <= 0 ? 'text-green-500' : 'text-red-500'}`}>{expPct > 0 ? '+' : ''}{expPct}% vs prev</p>}
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Net</p>
              <p className={`text-lg font-bold ${net >= 0 ? 'text-[var(--primary-600)]' : 'text-red-500'}`}>{net >= 0 ? '' : '-'}{fmt(net)}</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Savings Rate</p>
              <p className={`text-lg font-bold ${savings !== null && savings >= 0 ? 'text-[var(--primary-600)]' : 'text-red-500'}`}>
                {savings !== null ? `${savings.toFixed(1)}%` : '—'}
              </p>
            </div>
          </div>

          {/* ── Habits ── */}
          <Section title="Spending Habits" />
          <div className="grid grid-cols-2 gap-2 mb-2">
            {[
              { label: 'Saving Streak', value: `${streak} month${streak !== 1 ? 's' : ''}` },
              { label: 'Avg Daily (30d)', value: `${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(avgDailySpend)} MMK` },
              { label: 'Peak Spend Day', value: peakDay },
              { label: 'Top Expense Tag', value: topExpTag },
              { label: 'Best Saving Month', value: bestSavingMonth },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-gray-50 dark:bg-gray-800 px-3 py-2.5">
                <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* ── Expense Breakdown ── */}
          {topTags.length > 0 && (
            <>
              <Section title="Expense Breakdown" />
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={topTags.map(([name, val]) => ({ name, val }))} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={fmtC} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={72} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                    {topTags.map((_, i) => <Cell key={i} fill="var(--primary-500)" fillOpacity={1 - i * 0.12} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-left">Tag</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right">Amount</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTags.map(([name, val]) => (
                      <tr key={name}>
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

          {/* ── Tag Trend ── */}
          {expenseTags.length > 0 && (
            <>
              <Section title="Tag Trend (12 months)" />
              <div className="flex gap-2 overflow-x-auto pb-1 mb-2">
                {expenseTags.slice(0, 8).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTrendTag(t)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${activeTrendTag === t ? 'bg-[var(--primary-500)] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                  >{t}</button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={fmtC} width={40} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Line type="monotone" dataKey="total" stroke="var(--primary-500)" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}

          {/* ── Balance Table (12 months) ── */}
          {balanceRows.length > 0 && (
            <>
              <Section title="Balance (12 months)" />
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-left">Month</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right">Income</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right">Expense</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right">Net</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balanceRows.map((row) => {
                      carryOver += row.net;
                      return (
                        <tr key={row.label}>
                          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.label}</td>
                          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right text-green-600 dark:text-green-400">{fmt(row.income)}</td>
                          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right text-red-600 dark:text-red-400">{fmt(row.expense)}</td>
                          <td className={`border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right font-medium ${row.net >= 0 ? 'text-[var(--primary-600)] dark:text-[var(--primary-400)]' : 'text-red-600 dark:text-red-400'}`}>
                            {row.net >= 0 ? '' : '-'}{fmt(row.net)}
                          </td>
                          <td className={`border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right ${carryOver >= 0 ? 'text-[var(--primary-600)] dark:text-[var(--primary-400)]' : 'text-red-600 dark:text-red-400'}`}>
                            {carryOver >= 0 ? '' : '-'}{fmt(carryOver)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {thisMonth.length === 0 && balanceRows.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10">No transactions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportModal;
