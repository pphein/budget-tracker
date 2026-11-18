import React from 'react';
import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import {
  ArrowUpCircleIcon as ArrowUpSolid,
  ArrowDownCircleIcon as ArrowDownSolid,
  ScaleIcon as ScaleSolid,
} from '@heroicons/react/24/solid';
import { useLanguage } from '../i18n/LanguageContext';

const TABS = [
  { id: 'income',  labelKey: 'tab.income',  Icon: ArrowUpCircleIcon,   ActiveIcon: ArrowUpSolid,   color: 'text-green-500' },
  { id: 'expense', labelKey: 'tab.expense', Icon: ArrowDownCircleIcon, ActiveIcon: ArrowDownSolid, color: 'text-red-500'   },
  { id: 'balance', labelKey: 'tab.balance', Icon: ScaleIcon,           ActiveIcon: ScaleSolid,     color: 'text-[var(--primary-500)]' },
];

const BottomNav = ({ activeTab, onChange }) => {
  const { t } = useLanguage();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex z-40 safe-bottom">
      {TABS.map(({ id, labelKey, Icon, ActiveIcon, color }) => {
        const active = activeTab === id;
        const Ico = active ? ActiveIcon : Icon;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
              active ? color : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <Ico className="w-6 h-6 mb-0.5" />
            {t(labelKey)}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
