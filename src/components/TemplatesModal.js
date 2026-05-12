import React, { useState } from 'react';
import { XMarkIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const TemplatesModal = ({ isOpen, onClose, templates, allTags, onAdd, onDelete }) => {
  const [type, setType]   = useState('expense');
  const [tag, setTag]     = useState('');
  const [amount, setAmt]  = useState('');
  const [notes, setNotes] = useState('');
  const [label, setLabel] = useState('');

  if (!isOpen) return null;

  const typeTags = allTags.filter((t) => t.type === type);

  const handleAdd = () => {
    if (!tag || !amount) return;
    onAdd({ label: label || `${tag} ${amount}`, type, tag, amount: parseFloat(amount), notes });
    setLabel(''); setTag(''); setAmt(''); setNotes('');
  };

  const incTpl = templates.filter((t) => t.type === 'income');
  const expTpl = templates.filter((t) => t.type === 'expense');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Templates</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Add form */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">New Template</p>
            {/* Type toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {['income', 'expense'].map((t) => (
                <button key={t} onClick={() => { setType(t); setTag(''); }}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors ${type === t ? 'bg-[var(--primary-500)] text-white' : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional)"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none" />
            <select value={tag} onChange={(e) => setTag(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none">
              <option value="">Select tag…</option>
              {typeTags.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            <input type="number" value={amount} onChange={(e) => setAmt(e.target.value)} placeholder="Amount (MMK)"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none" />
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note (optional)"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none" />
            <button onClick={handleAdd} disabled={!tag || !amount}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-medium disabled:opacity-40">
              <PlusIcon className="w-4 h-4" /> Save Template
            </button>
          </div>

          {[['Expense', expTpl], ['Income', incTpl]].map(([heading, list]) => list.length > 0 && (
            <div key={heading}>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{heading}</p>
              <div className="space-y-2">
                {list.map((tpl) => (
                  <div key={tpl.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{tpl.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {tpl.tag} · {new Intl.NumberFormat().format(tpl.amount)} MMK{tpl.notes ? ` · ${tpl.notes}` : ''}
                      </p>
                    </div>
                    <button onClick={() => onDelete(tpl.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">No templates yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
