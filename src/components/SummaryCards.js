import React from 'react';

const fmt = (n) => new Intl.NumberFormat().format(Math.abs(n));

const SummaryCards = ({ transactions, activeTab, onTabChange }) => {
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const net     = income - expense;

  return (
    <div className="grid grid-cols-3 gap-2 px-2 pt-3 pb-1 w-full">
      <button
        onClick={() => onTabChange('income')}
        className={`rounded-xl p-3 text-center transition-all ${
          activeTab === 'income' ? 'ring-2 ring-green-400' : ''
        } bg-green-50 dark:bg-green-900/30`}
      >
        <div className="text-xs text-green-600 dark:text-green-400 font-medium">Income</div>
        <div className="text-sm font-bold text-green-700 dark:text-green-300 mt-1 truncate">{fmt(income)}</div>
      </button>

      <button
        onClick={() => onTabChange('expense')}
        className={`rounded-xl p-3 text-center transition-all ${
          activeTab === 'expense' ? 'ring-2 ring-red-400' : ''
        } bg-red-50 dark:bg-red-900/30`}
      >
        <div className="text-xs text-red-600 dark:text-red-400 font-medium">Expense</div>
        <div className="text-sm font-bold text-red-700 dark:text-red-300 mt-1 truncate">{fmt(expense)}</div>
      </button>

      <button
        onClick={() => onTabChange('balance')}
        className={`rounded-xl p-3 text-center transition-all bg-primary-tint ${
          activeTab === 'balance' ? 'ring-2 ring-[var(--primary-400)]' : ''
        }`}
      >
        <div className="text-xs text-[var(--primary-600)] dark:text-[var(--primary-400)] font-medium">Net</div>
        <div className={`text-sm font-bold mt-1 truncate ${
          net >= 0
            ? 'text-[var(--primary-700)] dark:text-[var(--primary-300)]'
            : 'text-red-700 dark:text-red-300'
        }`}>
          {net < 0 ? '-' : ''}{fmt(net)}
        </div>
      </button>
    </div>
  );
};

export default SummaryCards;
