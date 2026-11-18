import React from 'react';
import { getTagColorClasses } from '../utils/tagColors';
import { useLanguage } from '../i18n/LanguageContext';

const fmt = (n) => new Intl.NumberFormat().format(Math.round(n));

const AccountsSummary = ({ accounts, transactions, onManage }) => {
  const { t } = useLanguage();
  const active = accounts.filter((a) => !a.archived);
  if (active.length === 0) return null;

  const balanceFor = (id) =>
    transactions
      .filter((tx) => (tx.accountId || 'cash') === id)
      .reduce((acc, tx) => {
        if (tx.type === 'income')  return acc + parseFloat(tx.amount || 0);
        if (tx.type === 'expense') return acc - parseFloat(tx.amount || 0);
        return acc;
      }, 0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--primary-600)] dark:text-[var(--primary-400)]">
          {t('settings.accounts')}
        </h3>
        <button onClick={onManage} className="text-xs text-[var(--primary-500)] font-medium">
          {t('common.manage')}
        </button>
      </div>

      <div className="space-y-2">
        {active.map((a) => {
          const c = getTagColorClasses(a.colorIndex || 0);
          const balance = balanceFor(a.id);
          return (
            <div key={a.id} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                {a.name}
              </span>
              <span className={`text-sm font-semibold ${balance < 0 ? 'text-red-500' : 'text-gray-800 dark:text-gray-100'}`}>
                {fmt(balance)} MMK
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountsSummary;
