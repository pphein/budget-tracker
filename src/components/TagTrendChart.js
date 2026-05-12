import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fmtCompact = (v) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

const TagTrendChart = ({ transactions, allTags }) => {
  const [selectedTag, setSelectedTag] = useState('');

  const expenseTags = allTags.filter((t) => t.type === 'expense');
  const tag = selectedTag || expenseTags[0]?.name || '';

  // Build last 12 months
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    };
  });

  const data = months.map(({ year, month, label }) => {
    const total = transactions
      .filter((t) => t.tag === tag && t.type === 'expense')
      .filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      })
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    return { label, total };
  });

  if (expenseTags.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--primary-600)] dark:text-[var(--primary-400)]">
          Tag Trend (12 months)
        </h3>
        <select
          value={tag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none max-w-[130px]"
        >
          {expenseTags.map((t) => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} width={46} tickFormatter={fmtCompact} />
          <Tooltip formatter={(v) => new Intl.NumberFormat().format(v)} labelStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="total"
            stroke="var(--primary-500)"
            strokeWidth={2}
            dot={{ r: 2, fill: 'var(--primary-500)' }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TagTrendChart;
