import React, { useMemo } from 'react';
import { calcSavingsRate, calcIncomeStability, calcBudgetAdherence, calcHealthScore } from '../utils/financialHealth';
import { useLanguage } from '../i18n/LanguageContext';

const GRADE_COLOR = {
  A: 'text-green-600 dark:text-green-400',
  B: 'text-green-600 dark:text-green-400',
  C: 'text-yellow-600 dark:text-yellow-400',
  D: 'text-orange-600 dark:text-orange-400',
  F: 'text-red-600 dark:text-red-400',
};

const HealthScoreCard = ({ transactions, filterYears, filterMonths, budgetLimits }) => {
  const { t } = useLanguage();
  const result = useMemo(() => {
    const savingsRate = calcSavingsRate(transactions, filterYears, filterMonths);
    const incomeStability = calcIncomeStability(transactions);

    const expenseByTag = transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date);
        if (filterYears.length && !filterYears.includes(d.getFullYear())) return false;
        if (filterMonths.length && !filterMonths.includes(d.getMonth() + 1)) return false;
        return true;
      })
      .reduce((acc, t) => {
        acc[t.tag] = (acc[t.tag] || 0) + parseFloat(t.amount || 0);
        return acc;
      }, {});
    const budgetAdherence = calcBudgetAdherence(expenseByTag, budgetLimits);

    const health = calcHealthScore({ savingsRate, incomeStability, budgetAdherence });
    return { health, savingsRate, incomeStability, budgetAdherence };
  }, [transactions, filterYears, filterMonths, budgetLimits]);

  if (!result.health) return null;
  const { health, savingsRate, incomeStability, budgetAdherence } = result;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--primary-600)] dark:text-[var(--primary-400)]">
          {t('health.title')}
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold ${GRADE_COLOR[health.grade]}`}>{health.grade}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{health.score}/100</span>
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        {savingsRate.rate != null && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t('health.savingsRate')}</span>
            <span className="text-gray-700 dark:text-gray-200">{savingsRate.rate.toFixed(1)}%</span>
          </div>
        )}
        {incomeStability && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t('health.incomeStability')}</span>
            <span className="text-gray-700 dark:text-gray-200">
              {incomeStability.flags.length === 0 ? t('health.stable') : `${incomeStability.flags.length} dip${incomeStability.flags.length > 1 ? 's' : ''} (6 mo)`}
            </span>
          </div>
        )}
        {budgetAdherence && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t('health.budgetAdherence')}</span>
            <span className="text-gray-700 dark:text-gray-200">
              {budgetAdherence.totalCount - budgetAdherence.overCount}/{budgetAdherence.totalCount} within limit
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthScoreCard;
