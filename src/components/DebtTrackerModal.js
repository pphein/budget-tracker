import React, { useState } from 'react';
import { XMarkIcon, TrashIcon, PlusIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../i18n/LanguageContext';

const fmt = (n) => new Intl.NumberFormat().format(Math.round(n));

const DebtTrackerModal = ({ isOpen, onClose, debts, onAdd, onDelete, onLogPayment }) => {
  const { t } = useLanguage();
  const [name, setName]           = useState('');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate]           = useState('');
  const [payingId, setPayingId]   = useState(null);
  const [payAmount, setPayAmount] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!name || !principal) return;
    onAdd({ name, principal: parseFloat(principal), interestRate: rate ? parseFloat(rate) : null, startDate: new Date().toISOString() });
    setName(''); setPrincipal(''); setRate('');
  };

  const startPayment = (id) => { setPayingId(id); setPayAmount(''); };

  const submitPayment = () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;
    onLogPayment(payingId, amt);
    setPayingId(null);
    setPayAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">{t('debts.title')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('debts.newDebt')}</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('debts.namePlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
            />
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder={t('debts.principalPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
            />
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder={t('debts.interestPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={!name || !principal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-medium disabled:opacity-40"
            >
              <PlusIcon className="w-4 h-4" /> {t('debts.addDebt')}
            </button>
          </div>

          {debts.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">{t('debts.none')}</p>
          ) : (
            <div className="space-y-2">
              {debts.map((d) => {
                const remaining = Math.max(0, d.principal - (d.paidAmount || 0));
                return (
                  <div key={d.id} className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{d.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {fmt(remaining)} remaining of {fmt(d.principal)} MMK
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startPayment(d.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg" title="Log payment">
                          <BanknotesIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(d.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {payingId === d.id && (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          autoFocus
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          placeholder={t('form.amount')}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                        />
                        <button onClick={submitPayment} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium">{t('debts.logPayment')}</button>
                        <button onClick={() => setPayingId(null)} className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">{t('common.cancel')}</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtTrackerModal;
