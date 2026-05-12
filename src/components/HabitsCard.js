import React from 'react';
import { FireIcon } from '@heroicons/react/24/outline';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmtCompact = (n) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const HabitsCard = ({ transactions }) => {
  if (transactions.length === 0) return null;

  const now = new Date();

  // Group by local date string
  const byDate = {};
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (!byDate[key]) byDate[key] = { income: 0, expense: 0 };
    if (t.type === 'income')  byDate[key].income  += parseFloat(t.amount || 0);
    if (t.type === 'expense') byDate[key].expense += parseFloat(t.amount || 0);
  });

  // Saving streak — consecutive past days where net >= 0
  let streak = 0;
  const check = new Date(now);
  check.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const key = `${check.getFullYear()}-${String(check.getMonth()+1).padStart(2,'0')}-${String(check.getDate()).padStart(2,'0')}`;
    const day = byDate[key];
    if (!day) break;
    if (day.income >= day.expense) streak++;
    else break;
    check.setDate(check.getDate() - 1);
  }

  // Avg daily expense — last 30 days
  const ago30 = new Date(now);
  ago30.setDate(ago30.getDate() - 30);
  const exp30 = transactions
    .filter((t) => t.type === 'expense' && new Date(t.date) >= ago30)
    .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const avgDaily = exp30 / 30;

  // Top spending day of week — last 90 days
  const ago90 = new Date(now);
  ago90.setDate(ago90.getDate() - 90);
  const dowTotals = [0, 0, 0, 0, 0, 0, 0];
  transactions
    .filter((t) => t.type === 'expense' && new Date(t.date) >= ago90)
    .forEach((t) => { dowTotals[new Date(t.date).getDay()] += parseFloat(t.amount || 0); });
  const topDow = dowTotals.indexOf(Math.max(...dowTotals));

  // Best saving month (highest net)
  const byMonth = {};
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0 };
    if (t.type === 'income')  byMonth[key].income  += parseFloat(t.amount || 0);
    if (t.type === 'expense') byMonth[key].expense += parseFloat(t.amount || 0);
  });
  const months = Object.entries(byMonth).map(([k, v]) => ({ month: k, net: v.income - v.expense }));
  const bestMonth = months.sort((a, b) => b.net - a.net)[0];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-3">
      <h3 className="text-sm font-semibold text-[var(--primary-600)] dark:text-[var(--primary-400)] mb-3">Habits</h3>

      <div className="grid grid-cols-2 gap-2 mb-2">
        {/* Streak */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 flex items-center gap-3">
          <FireIcon className="w-6 h-6 text-orange-400 flex-shrink-0" />
          <div>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{streak} day{streak !== 1 ? 's' : ''}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">saving streak</p>
          </div>
        </div>

        {/* Avg daily */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{fmtCompact(avgDaily)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">avg spend/day (30d)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Top spend day */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{DAYS[topDow]}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">highest spend day</p>
        </div>

        {/* Best month */}
        {bestMonth && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
            <p className="text-lg font-bold text-[var(--primary-600)] dark:text-[var(--primary-400)]">
              {new Date(bestMonth.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">best saving month</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitsCard;
