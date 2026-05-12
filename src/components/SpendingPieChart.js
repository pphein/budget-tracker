import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getTagColorClasses } from '../utils/tagColors';

const TAG_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e','#14b8a6',
  '#3b82f6','#8b5cf6','#ec4899','#64748b','#06b6d4',
];

const fmt    = (n) => new Intl.NumberFormat().format(Math.round(n));
const fmtPct = (p) => `${p.toFixed(1)}%`;

const getColor = (tagName, allTags, index) => {
  const tag = allTags?.find((t) => t.name === tagName);
  return TAG_COLORS[(tag?.colorIndex ?? index) % TAG_COLORS.length];
};

const CustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 shadow text-xs">
      <p className="font-medium text-gray-800 dark:text-gray-100">{name}</p>
      <p className="text-gray-500 dark:text-gray-400">
        {fmt(value)} ({fmtPct((value / total) * 100)})
      </p>
    </div>
  );
};

const SpendingPieChart = ({ transactions, allTags, type = 'expense' }) => {
  const byTag = transactions
    .filter((t) => t.type === type)
    .reduce((acc, t) => {
      acc[t.tag] = (acc[t.tag] || 0) + parseFloat(t.amount || 0);
      return acc;
    }, {});

  const total = Object.values(byTag).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const data = Object.entries(byTag)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        {type === 'expense' ? 'Expense' : 'Income'} Breakdown
      </h3>

      <div className="flex gap-3 items-center">
        {/* Donut */}
        <div className="w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={34}
                outerRadius={58}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={getColor(entry.name, allTags, index)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {data.map((entry, index) => {
            const color = getColor(entry.name, allTags, index);
            const pct   = (entry.value / total) * 100;
            return (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">{entry.name}</span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {fmtPct(pct)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpendingPieChart;
