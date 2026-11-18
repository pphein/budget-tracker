import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../i18n/LanguageContext';

const fmt = (n) => new Intl.NumberFormat().format(Math.round(n));

const DebtTracker = ({ debts, onManage }) => {
  const { t } = useLanguage();
  if (debts.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--primary-600)] dark:text-[var(--primary-400)]">
          {t('debts.title')}
        </h3>
        <button onClick={onManage} className="text-xs text-[var(--primary-500)] font-medium">
          {t('common.manage')}
        </button>
      </div>

      <div className="space-y-3">
        {debts.map((debt) => {
          const paid = Math.min(debt.paidAmount || 0, debt.principal);
          const remaining = Math.max(0, debt.principal - paid);
          const pct = debt.principal > 0 ? (paid / debt.principal) * 100 : 0;
          const done = remaining <= 0;

          return (
            <div key={debt.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {done && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{debt.name}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {fmt(remaining)} left of {fmt(debt.principal)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${done ? 'bg-emerald-400' : 'bg-red-400'}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-gray-400 dark:text-gray-500">{pct.toFixed(1)}% paid</span>
                {debt.interestRate ? (
                  <span className="text-xs text-gray-400 dark:text-gray-500">{debt.interestRate}% interest</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DebtTracker;
