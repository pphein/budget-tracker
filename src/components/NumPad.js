import React, { useState } from 'react';
import { BackspaceIcon } from '@heroicons/react/24/outline';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

const NumPad = ({ value, onChange, placeholder = 'Amount' }) => {
  const [open, setOpen] = useState(false);

  const handleKey = (key) => {
    if (key === '⌫') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!value.includes('.')) onChange(value + '.');
      return;
    }
    // Limit to 2 decimal places
    const parts = value.split('.');
    if (parts[1] !== undefined && parts[1].length >= 2) return;
    // Replace leading zero
    if (value === '0') {
      onChange(key);
    } else {
      onChange(value + key);
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 min-w-0 py-2.5 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-left"
      >
        {value ? (
          <span className="text-gray-800 dark:text-gray-200">{value}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </button>

      {/* NumPad sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

          {/* Sheet */}
          <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Amount display */}
            <div className="px-6 pt-2 pb-4 text-right border-b border-gray-100 dark:border-gray-800">
              <span className={`text-4xl font-light tracking-wide ${value ? 'text-gray-800 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                {value || '0'}
              </span>
            </div>

            {/* Keys */}
            <div className="grid grid-cols-3">
              {KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKey(key)}
                  className="flex items-center justify-center py-5 text-xl font-medium text-gray-800 dark:text-white active:bg-gray-100 dark:active:bg-gray-800 transition-colors border-b border-r border-gray-100 dark:border-gray-800"
                >
                  {key === '⌫' ? (
                    <BackspaceIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  ) : (
                    key
                  )}
                </button>
              ))}
            </div>

            {/* Done */}
            <div className="p-4 pb-8">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full py-3.5 rounded-xl bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white font-semibold text-base transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NumPad;
