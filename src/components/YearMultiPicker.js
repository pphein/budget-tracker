import React from 'react';

// selected: string[]  e.g. ["2024", "2026"]
const YearMultiPicker = ({ selected, onChange }) => {
  const current = new Date().getFullYear();
  // Show 10 years: current-8 … current+1
  const years = Array.from({ length: 10 }, (_, i) => current - 8 + i);

  const toggle = (year) => {
    const key = String(year);
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key].sort()
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
      <div className="grid grid-cols-4 gap-1.5">
        {years.map((year) => {
          const key = String(year);
          const sel = selected.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggle(year)}
              className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                sel
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-600'
              }`}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default YearMultiPicker;
