import React from 'react';
import { TrophyIcon } from '@heroicons/react/24/outline';

const fmt = (n) => new Intl.NumberFormat().format(Math.round(n));

const SavingsGoals = ({ goals, transactions, onManage }) => {
  if (goals.length === 0) return null;

  const computeCurrent = (goal) => {
    const from = goal.startDate ? new Date(goal.startDate) : new Date(0);
    return transactions
      .filter((t) => new Date(t.date) >= from)
      .reduce((acc, t) => {
        if (t.type === 'income')  return acc + parseFloat(t.amount || 0);
        if (t.type === 'expense') return acc - parseFloat(t.amount || 0);
        return acc;
      }, 0);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--primary-600)] dark:text-[var(--primary-400)]">
          Savings Goals
        </h3>
        <button
          onClick={onManage}
          className="text-xs text-[var(--primary-500)] font-medium"
        >
          Manage
        </button>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const current = Math.max(0, computeCurrent(goal));
          const pct = Math.min(100, goal.targetAmount > 0 ? (current / goal.targetAmount) * 100 : 0);
          const done = pct >= 100;

          return (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {done && <TrophyIcon className="w-4 h-4 text-yellow-500" />}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{goal.name}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {fmt(current)} / {fmt(goal.targetAmount)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${done ? 'bg-yellow-400' : 'bg-[var(--primary-500)]'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-gray-400 dark:text-gray-500">{pct.toFixed(1)}%</span>
                {goal.deadline && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    By {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsGoals;
