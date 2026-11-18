import React, { useState } from 'react';
import { ChevronDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getTagColorClasses } from '../utils/tagColors';
import { useLanguage } from '../i18n/LanguageContext';

// Single-select account picker — same bottom-sheet pattern as TagSelect
const AccountSelect = ({ accounts, value, onChange, placeholder }) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const placeholderText = placeholder ?? t('form.selectAccount');
  const active = accounts.filter((a) => !a.archived);

  const selected = active.find((a) => a.id === value);
  const selectedColor = selected ? getTagColorClasses(selected.colorIndex || 0) : null;

  const handleSelect = (id) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2.5 pl-3 pr-10 text-left text-sm"
      >
        {selected && selectedColor ? (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${selectedColor.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${selectedColor.dot}`} />
            {selected.name}
          </span>
        ) : (
          <span className="text-gray-400">{placeholderText}</span>
        )}
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl flex flex-col w-full max-w-sm max-h-[72vh]">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">{t('form.selectAccount')}</h3>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
              {active.map((a) => {
                const c = getTagColorClasses(a.colorIndex || 0);
                const sel = a.id === value;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleSelect(a.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${c.bg} ${
                      sel ? 'ring-2 ring-offset-1 ring-[var(--primary-500)] dark:ring-offset-gray-900' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                      {a.name}
                    </span>
                    {sel && <CheckIcon className="w-4 h-4 text-[var(--primary-600)]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountSelect;
