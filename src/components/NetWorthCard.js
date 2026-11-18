import React from 'react';
import { calcNetWorth } from '../utils/netWorth';
import { useLanguage } from '../i18n/LanguageContext';

const fmt = (n) => new Intl.NumberFormat().format(Math.round(n));

const NetWorthCard = ({ accounts, transactions, assets, debts, goldPrices, onManage }) => {
  const { t } = useLanguage();
  const { accountBalance, assetsValue, debtsRemaining, netWorth } =
    calcNetWorth({ accounts, transactions, assets, debts, goldPrices });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--primary-600)] dark:text-[var(--primary-400)]">
          {t('networth.title')}
        </h3>
        <button onClick={onManage} className="text-xs text-[var(--primary-500)] font-medium">
          {t('common.manage')}
        </button>
      </div>

      <p className={`text-2xl font-bold mb-3 ${netWorth < 0 ? 'text-red-500' : 'text-gray-800 dark:text-gray-100'}`}>
        {fmt(netWorth)} MMK
      </p>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">{t('networth.accountBalances')}</span>
          <span className="text-gray-700 dark:text-gray-200">{fmt(accountBalance)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">{t('networth.otherAssets')}</span>
          <span className="text-gray-700 dark:text-gray-200">{fmt(assetsValue)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">{t('networth.debtsRemaining')}</span>
          <span className="text-red-500">-{fmt(debtsRemaining)}</span>
        </div>
      </div>
    </div>
  );
};

export default NetWorthCard;
