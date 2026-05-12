import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getBudgetLimits, setBudgetLimit } from '../utils/budgetLimits';

const BudgetLimitsModal = ({ isOpen, onClose, expenseTags, onChange }) => {
  const [limits, setLimits] = useState({});

  useEffect(() => {
    if (isOpen) setLimits(getBudgetLimits());
  }, [isOpen]);

  const handleBlur = (tagName, value) => {
    const num     = parseFloat(value) || 0;
    const updated = setBudgetLimit(tagName, num > 0 ? num : null);
    setLimits(updated);
    onChange(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Monthly Budget Limits</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Leave blank to remove a limit</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {expenseTags.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-12">No expense tags found.</p>
        ) : (
          <div className="space-y-2">
            {expenseTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 shadow-sm"
              >
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{tag.name}</span>
                <input
                  type="number"
                  placeholder="No limit"
                  defaultValue={limits[tag.name] || ''}
                  key={`${tag.name}-${isOpen}`}
                  onBlur={(e) => handleBlur(tag.name, e.target.value)}
                  className="w-32 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none text-right"
                  min="0"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetLimitsModal;
