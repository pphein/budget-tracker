import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// selected: string[]  e.g. ["2026-05", "2026-07"]
const MonthMultiPicker = ({ selected, onChange }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  const toggle = (key) => {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key].sort()
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
      {/* Year navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setYear((y) => y - 1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{year}</span>
        <button
          onClick={() => setYear((y) => y + 1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 4×3 month grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {MONTHS.map((label, i) => {
          const key = `${year}-${String(i + 1).padStart(2, '0')}`;
          const sel = selected.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                sel
                  ? 'bg-[var(--primary-500)] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-600'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthMultiPicker;
