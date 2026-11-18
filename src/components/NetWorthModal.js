import React, { useState } from 'react';
import { XMarkIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { valueOfAsset } from '../utils/netWorth';
import { useLanguage } from '../i18n/LanguageContext';

const fmt = (n) => new Intl.NumberFormat().format(Math.round(n));

const TYPES = [
  { value: 'bank',  label: 'Bank' },
  { value: 'gold',  label: 'Gold' },
  { value: 'other', label: 'Other' },
];

const NetWorthModal = ({ isOpen, onClose, assets, goldPrices, onAdd, onDelete }) => {
  const { t } = useLanguage();
  const [name, setName]   = useState('');
  const [type, setType]   = useState('bank');
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!name || !value) return;
    const entry = type === 'gold'
      ? { name, type, goldUnits: parseFloat(value) }
      : { name, type, value: parseFloat(value) };
    onAdd(entry);
    setName(''); setValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">{t('networth.title')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('networth.newAsset')}</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('networth.namePlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
            />
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    type === t.value ? 'bg-[var(--primary-500)] text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === 'gold' ? t('networth.weightPlaceholder') : t('networth.valuePlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
            />
            {type === 'gold' && !goldPrices?.myanmarPrice && (
              <p className="text-xs text-amber-500">Set a Myanmar gold price in Settings to value this asset.</p>
            )}
            <button
              onClick={handleAdd}
              disabled={!name || !value}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-medium disabled:opacity-40"
            >
              <PlusIcon className="w-4 h-4" /> {t('networth.addAsset')}
            </button>
          </div>

          {assets.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">{t('networth.none')}</p>
          ) : (
            <div className="space-y-2">
              {assets.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{a.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {fmt(valueOfAsset(a, goldPrices))} MMK
                      {a.type === 'gold' ? ` (${a.goldUnits} kyat-tha)` : ''}
                    </p>
                  </div>
                  <button onClick={() => onDelete(a.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetWorthModal;
