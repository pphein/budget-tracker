import React, { useState, useRef } from 'react';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const intlFmt  = new Intl.NumberFormat();
const intlFmtS = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const fmt  = (n) => intlFmt.format(Math.round(Math.abs(n)));
const fmtS = (n) => intlFmtS.format(n);
const pctChange = (cur, prev) => prev > 0 ? (((cur - prev) / prev) * 100).toFixed(1) : null;
const DAY_NAMES    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Read a CSS variable from :root as a hex/rgb string
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const Section = ({ title }) => (
  <div className="flex items-center gap-2 mt-5 mb-3">
    <div className="w-1 h-4 rounded-full bg-[var(--primary-500)]" />
    <p className="text-xs font-bold text-[var(--primary-600)] dark:text-[var(--primary-400)] uppercase tracking-wider">{title}</p>
  </div>
);

const StatCard = ({ label, value, sub, color }) => {
  const colorMap = {
    green:   'bg-green-50  dark:bg-green-900/20  border-green-200  dark:border-green-800',
    red:     'bg-red-50    dark:bg-red-900/20    border-red-200    dark:border-red-800',
    primary: 'bg-[var(--primary-50)] dark:bg-[var(--primary-900)]/20 border-[var(--primary-200)] dark:border-[var(--primary-800)]',
    neutral: 'bg-gray-50   dark:bg-gray-800       border-gray-200   dark:border-gray-700',
  };
  const valMap = {
    green:   'text-green-600   dark:text-green-400',
    red:     'text-red-600     dark:text-red-400',
    primary: 'text-[var(--primary-600)] dark:text-[var(--primary-400)]',
    neutral: 'text-gray-700    dark:text-gray-200',
  };
  return (
    <div className={`rounded-xl border p-3 ${colorMap[color] || colorMap.neutral}`}>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold leading-tight ${valMap[color] || valMap.neutral}`}>{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${sub.startsWith('+') ? 'text-green-500' : sub.startsWith('-') ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>{sub}</p>}
    </div>
  );
};

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
  const topTags   = Object.entries(tagTotals).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topExpTag = topTags[0]?.[0] || '—';

  // ── Habits ───────────────────────────────────────────────────────────────
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
  const last30 = transactions.filter((t) => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo);
  const avgDailySpend = last30.reduce((s, t) => s + parseFloat(t.amount || 0), 0) / 30;

  let streak = 0;
  for (let i = 0; i < 12; i++) {
    let y = cy, m = cm - i;
    while (m <= 0) { m += 12; y -= 1; }
    const inc = transactions.filter((t) => t.type === 'income'  && inMonth(t.date, y, m)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const exp = transactions.filter((t) => t.type === 'expense' && inMonth(t.date, y, m)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    if (inc - exp > 0) streak++; else break;
  }

  const ninetyAgo = new Date(now); ninetyAgo.setDate(now.getDate() - 90);
  const dayTotals = Array(7).fill(0);
  transactions.filter((t) => t.type === 'expense' && new Date(t.date) >= ninetyAgo)
    .forEach((t) => { dayTotals[new Date(t.date).getDay()] += parseFloat(t.amount || 0); });
  const peakDayIdx = dayTotals.indexOf(Math.max(...dayTotals));
  const peakDay    = Math.max(...dayTotals) > 0 ? DAY_NAMES[peakDayIdx] : '—';

  let bestSavingMonth = '—', bestNet = -Infinity;
  for (let i = 0; i < 12; i++) {
    let y = cy, m = cm - i;
    while (m <= 0) { m += 12; y -= 1; }
    const inc = transactions.filter((t) => t.type === 'income'  && inMonth(t.date, y, m)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const exp = transactions.filter((t) => t.type === 'expense' && inMonth(t.date, y, m)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const n = inc - exp;
    if (n > bestNet) { bestNet = n; bestSavingMonth = new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); }
  }

  // ── Tag trend ────────────────────────────────────────────────────────────
  const expenseTags    = [...new Set(transactions.filter((t) => t.type === 'expense').map((t) => t.tag))].sort();
  const activeTrendTag = trendTag || expenseTags[0] || '';
  const trendData      = Array.from({ length: 12 }, (_, i) => {
    let y = cy, m = cm - (11 - i);
    while (m <= 0) { m += 12; y -= 1; }
    const total = transactions
      .filter((t) => t.type === 'expense' && t.tag === activeTrendTag && inMonth(t.date, y, m))
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    return { month: MONTH_LABELS[m - 1], total };
  });

  // ── Balance rows (last 12 months) ────────────────────────────────────────
  const balanceRows = Array.from({ length: 12 }, (_, i) => {
    let y = cy, m = cm - (11 - i);
    while (m <= 0) { m += 12; y -= 1; }
    const inc = transactions.filter((t) => t.type === 'income'  && inMonth(t.date, y, m)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const exp = transactions.filter((t) => t.type === 'expense' && inMonth(t.date, y, m)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    return { label: new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), income: inc, expense: exp, net: inc - exp };
  }).filter((r) => r.income > 0 || r.expense > 0);
  let carryOver = 0;

  // ── Print — capture live CSS variables so PDF uses the current theme ──────
  const handlePrint = () => {
    const p500 = cssVar('--primary-500') || '#3b82f6';
    const p600 = cssVar('--primary-600') || '#2563eb';
    const p50  = cssVar('--primary-50')  || '#eff6ff';
    const content = printRef.current?.innerHTML || '';
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Report — ${monthName}</title>
    <style>
      :root { --p500: ${p500}; --p600: ${p600}; --p50: ${p50}; }
      * { box-sizing: border-box; }
      body { font-family: -apple-system, sans-serif; padding: 28px; color: #111; font-size: 13px; margin: 0; }
      /* header */
      .rpt-header { background: var(--p500); color: #fff; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; }
      .rpt-header h1 { margin: 0 0 2px; font-size: 20px; }
      .rpt-header p  { margin: 0; font-size: 12px; opacity: .8; }
      /* sections */
      .section-title { display: flex; align-items: center; gap: 8px; margin: 20px 0 10px; }
      .section-bar   { width: 4px; height: 16px; border-radius: 4px; background: var(--p500); }
      .section-label { font-size: 11px; font-weight: 700; color: var(--p600); text-transform: uppercase; letter-spacing: .07em; }
      /* stat grid */
      .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
      .card  { border-radius: 10px; padding: 12px 14px; border: 1.5px solid #e5e7eb; }
      .card-green   { background: #f0fdf4; border-color: #bbf7d0; }
      .card-red     { background: #fff1f2; border-color: #fecaca; }
      .card-primary { background: var(--p50); border-color: var(--p500); }
      .card-neutral { background: #f9fafb; border-color: #e5e7eb; }
      .card-label { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
      .card-value { font-size: 18px; font-weight: 700; line-height: 1.2; }
      .val-green   { color: #16a34a; }
      .val-red     { color: #dc2626; }
      .val-primary { color: var(--p600); }
      .val-neutral { color: #111; }
      .card-sub { font-size: 11px; margin-top: 3px; color: #6b7280; }
      .sub-green { color: #16a34a; }
      .sub-red   { color: #dc2626; }
      /* tables */
      table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 6px; }
      th, td { border: 1px solid #e5e7eb; padding: 6px 9px; }
      th { background: var(--p50); color: var(--p600); font-weight: 600; font-size: 11px; }
      td.r { text-align: right; }
      .td-green { color: #16a34a; }
      .td-red   { color: #dc2626; }
      .td-primary { color: var(--p600); font-weight: 600; }
      /* trend tag buttons — hide interactive elements in print */
      button { display: none !important; }
      /* recharts SVG preserves colors automatically */
      svg text { font-size: 10px !important; }
    </style></head><body>
    <div class="rpt-header"><h1>${monthName}</h1><p>${txCount} transaction${txCount !== 1 ? 's' : ''}</p></div>
    ${content}
    </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: 'var(--primary-500)' }}
      >
        <div>
          <h2 className="text-base font-bold text-white">Report</h2>
          <p className="text-xs text-white/70">{monthName} · {txCount} transaction{txCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium"
          >
            <PrinterIcon className="w-4 h-4" /> Print / PDF
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4" ref={printRef}>

        {/* ── Spending Insights ── */}
        <Section title="Spending Insights" />
        <div className="grid grid-cols-2 gap-2 mb-1">
          <StatCard label="Income"  value={fmt(income)}  color="green"
            sub={incPct !== null ? `${parseFloat(incPct) >= 0 ? '+' : ''}${incPct}% vs prev` : null} />
          <StatCard label="Expense" value={fmt(expense)} color="red"
            sub={expPct !== null ? `${parseFloat(expPct) >= 0 ? '+' : ''}${expPct}% vs prev` : null} />
          <StatCard label="Net"
            value={`${net < 0 ? '-' : ''}${fmt(net)}`}
            color={net >= 0 ? 'primary' : 'red'} />
          <StatCard label="Savings Rate"
            value={savings !== null ? `${savings.toFixed(1)}%` : '—'}
            color={savings !== null && savings >= 0 ? 'primary' : 'red'} />
        </div>

        {/* ── Spending Habits ── */}
        <Section title="Spending Habits" />
        <div className="grid grid-cols-2 gap-2 mb-1">
          {[
            { label: 'Saving Streak',     value: `${streak} month${streak !== 1 ? 's' : ''}`, color: streak > 0 ? 'primary' : 'neutral' },
            { label: 'Avg Daily (30d)',    value: `${fmtS(avgDailySpend)} MMK`,                color: 'neutral' },
            { label: 'Peak Spend Day',    value: peakDay,                                      color: 'neutral' },
            { label: 'Top Expense Tag',   value: topExpTag,                                    color: 'red'     },
            { label: 'Best Saving Month', value: bestSavingMonth,                              color: 'green'   },
          ].map(({ label, value, color }) => (
            <StatCard key={label} label={label} value={value} color={color} />
          ))}
        </div>

        {/* ── Expense Breakdown ── */}
        {topTags.length > 0 && (
          <>
            <Section title="Expense Breakdown" />
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-2">
              <ResponsiveContainer width="100%" height={Math.max(100, topTags.length * 28)}>
                <BarChart data={topTags.map(([name, val]) => ({ name, val }))} layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={fmtS} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={76} />
                  <Tooltip
                    formatter={(v) => fmt(v)}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                  <Bar dataKey="val" radius={[0, 6, 6, 0]}>
                    {topTags.map((_, i) => (
                      <Cell key={i} fill="var(--primary-500)" fillOpacity={1 - i * 0.13} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto mb-1">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr style={{ background: 'var(--primary-50)' }}>
                    <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-left text-[var(--primary-600)] dark:text-[var(--primary-400)]">Tag</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right text-[var(--primary-600)] dark:text-[var(--primary-400)]">Amount</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right text-[var(--primary-600)] dark:text-[var(--primary-400)]">%</th>
                  </tr>
                </thead>
                <tbody>
                  {topTags.map(([name, val], i) => (
                    <tr key={name} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/60'}>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-gray-700 dark:text-gray-300 font-medium">{name}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{fmt(val)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right text-[var(--primary-600)] dark:text-[var(--primary-400)] font-medium">
                        {expense > 0 ? ((val / expense) * 100).toFixed(1) : 0}%
                      </td>
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
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeTrendTag === t
                      ? 'bg-[var(--primary-500)] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >{t}</button>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-1">
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={trendData} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={fmtS} width={42} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Line
                    type="monotone" dataKey="total"
                    stroke="var(--primary-500)" strokeWidth={2.5}
                    dot={{ r: 3, fill: 'var(--primary-500)', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* ── Balance Table ── */}
        {balanceRows.length > 0 && (
          <>
            <Section title="Balance (12 months)" />
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr style={{ background: 'var(--primary-500)' }}>
                    {['Month','Income','Expense','Net','Balance'].map((h, i) => (
                      <th key={h} className={`border border-[var(--primary-400)] px-2 py-2 font-semibold text-white ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {balanceRows.map((row, idx) => {
                    carryOver += row.net;
                    return (
                      <tr key={row.label} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/60'}>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{row.label}</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right text-green-600 dark:text-green-400 font-medium">{fmt(row.income)}</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right text-red-600 dark:text-red-400 font-medium">{fmt(row.expense)}</td>
                        <td className={`border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right font-bold ${row.net >= 0 ? 'text-[var(--primary-600)] dark:text-[var(--primary-400)]' : 'text-red-600 dark:text-red-400'}`}>
                          {row.net < 0 ? '-' : ''}{fmt(row.net)}
                        </td>
                        <td className={`border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-right text-xs font-semibold ${carryOver >= 0 ? 'text-[var(--primary-600)] dark:text-[var(--primary-400)]' : 'text-red-600 dark:text-red-400'}`}>
                          {carryOver < 0 ? '-' : ''}{fmt(carryOver)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--primary-50)' }}>
                    <td className="border border-gray-200 dark:border-gray-700 px-2 py-2 font-bold text-[var(--primary-700)] dark:text-[var(--primary-300)]">Total</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-2 py-2 text-right font-bold text-green-600 dark:text-green-400">
                      {fmt(balanceRows.reduce((s, r) => s + r.income, 0))}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-2 py-2 text-right font-bold text-red-600 dark:text-red-400">
                      {fmt(balanceRows.reduce((s, r) => s + r.expense, 0))}
                    </td>
                    <td colSpan={2} className="border border-gray-200 dark:border-gray-700 px-2 py-2 text-right font-bold text-[var(--primary-600)] dark:text-[var(--primary-400)]">
                      {(() => { const t = balanceRows.reduce((s, r) => s + r.net, 0); return `${t < 0 ? '-' : ''}${fmt(t)}`; })()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {thisMonth.length === 0 && balanceRows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <p className="text-base font-medium">No transactions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReportModal;
