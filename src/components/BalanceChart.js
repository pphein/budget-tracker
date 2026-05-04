import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

const fmtK = (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v);
const fmtFull = (v) => new Intl.NumberFormat().format(v);

const formatLabel = (dateKey, view) => {
  if (view === 'yearly')  return dateKey;                      // "2026"
  if (view === 'monthly') {
    const [y, m] = dateKey.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); // "Jan '26"
  }
  return dateKey.slice(5); // "MM-DD"
};

const BalanceChart = ({ data, view = 'daily' }) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map((row) => ({
    date: formatLabel(row.date, view),
    Income: row.income,
    Expense: row.expense,
  }));

  return (
    <div className="w-full h-52 mb-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} width={44} tickFormatter={fmtK} />
          <Tooltip formatter={(value) => fmtFull(value)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Income"  fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={32} />
          <Bar dataKey="Expense" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceChart;
