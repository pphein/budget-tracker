import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

const fmtK    = (v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v);
const fmtFull = (v) => new Intl.NumberFormat().format(Math.round(v));

const formatLabel = (dateKey, view) => {
  if (view === 'yearly')  return dateKey;
  if (view === 'monthly') {
    const [y, m] = dateKey.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  return dateKey.slice(5);
};

const BalanceChart = ({ data, view = 'daily' }) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map((row, i, arr) => {
    const net    = row.income - row.expense;
    const window = arr.slice(Math.max(0, i - 2), i + 1);
    const avgNet = Math.round(window.reduce((s, r) => s + r.income - r.expense, 0) / window.length);
    return {
      date:           formatLabel(row.date, view),
      Income:         row.income,
      Expense:        row.expense,
      'Rolling Avg':  avgNet,
    };
  });

  return (
    <div className="w-full h-52 mb-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} width={44} tickFormatter={fmtK} />
          <Tooltip formatter={(value, name) => [fmtFull(value), name]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Income"  fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={32} />
          <Bar dataKey="Expense" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={32} />
          {data.length >= 2 && (
            <Line
              dataKey="Rolling Avg"
              type="monotone"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceChart;
