import React, { useState } from 'react';
import { XMarkIcon, TrashIcon, PlusIcon, ArchiveBoxIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { getTagColorClasses } from '../utils/tagColors';
import { useLanguage } from '../i18n/LanguageContext';

const AccountsModal = ({ isOpen, onClose, accounts, transactions, onAdd, onArchive, onUnarchive, onDelete }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), colorIndex: accounts.length % 10 });
    setName('');
  };

  const inUse = (id) => transactions.some((t) => t.accountId === id);

  const active = accounts.filter((a) => !a.archived);
  const archived = accounts.filter((a) => a.archived);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">{t('accounts.title')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('accounts.newAccount')}</p>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('accounts.namePlaceholder')}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
              />
              <button
                onClick={handleAdd}
                disabled={!name.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-medium disabled:opacity-40"
              >
                <PlusIcon className="w-4 h-4" /> {t('common.add')}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {active.map((a) => {
              const c = getTagColorClasses(a.colorIndex || 0);
              return (
                <div key={a.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    {a.name}
                  </span>
                  {a.id !== 'cash' && (
                    inUse(a.id) ? (
                      <button onClick={() => onArchive(a.id)} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Archive (has transactions)">
                        <ArchiveBoxIcon className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => onDelete(a.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {archived.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('accounts.archived')}</p>
              {archived.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl opacity-60">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{a.name}</span>
                  <button onClick={() => onUnarchive(a.id)} className="p-1.5 text-[var(--primary-500)] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Unarchive">
                    <ArrowUturnLeftIcon className="w-4 h-4" />
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

export default AccountsModal;
