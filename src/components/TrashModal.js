import React, { useState } from 'react';
import { XMarkIcon, ArrowUturnLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../i18n/LanguageContext';

const TrashModal = ({ isOpen, onClose, trashedTransactions, onRestore, onPurge }) => {
  const { t } = useLanguage();
  const [confirmingId, setConfirmingId] = useState(null);

  if (!isOpen) return null;

  const handlePurgeClick = (id) => {
    if (confirmingId === id) {
      onPurge(id);
      setConfirmingId(null);
    } else {
      setConfirmingId(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">{t('trash.title')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t('trash.retention')}
          </p>

          {trashedTransactions.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">{t('trash.empty')}</p>
          ) : (
            <div className="space-y-2">
              {trashedTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{tx.tag}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Intl.NumberFormat().format(tx.amount)} MMK · {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onRestore(tx.id)}
                      className="p-1.5 text-[var(--primary-500)] hover:bg-[var(--primary-50)] dark:hover:bg-gray-700 rounded-lg"
                      title={t('trash.restore')}
                    >
                      <ArrowUturnLeftIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePurgeClick(tx.id)}
                      className={`p-1.5 rounded-lg ${confirmingId === tx.id
                        ? 'bg-red-500 text-white'
                        : 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                      title={t('trash.deleteForever')}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrashModal;
