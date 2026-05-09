import React, { useState } from 'react';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid';
import { getTagColorClasses } from '../utils/tagColors';

// Single-select tag picker — opens a bottom-sheet modal with a tag grid
const TagSelect = ({ tags, value, onChange, placeholder = 'Select a tag…' }) => {
  const [open, setOpen] = useState(false);

  const selected      = tags.find((t) => t.name === value);
  const selectedColor = selected ? getTagColorClasses(selected.colorIndex) : null;

  const handleSelect = (tagName) => {
    onChange(tagName);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger */}
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
          <span className="text-gray-400">{placeholder}</span>
        )}
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </span>
      </button>

      {/* Bottom-sheet modal */}
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl flex flex-col max-h-[72vh]">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Select Tag</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Tag grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {tags.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">No tags found</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {tags.map((t) => {
                    const c   = getTagColorClasses(t.colorIndex);
                    const sel = t.name === value;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelect(t.name)}
                        className={`relative flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-center transition-all ${c.bg} ${
                          sel ? 'ring-2 ring-offset-1 ring-[var(--primary-500)] dark:ring-offset-gray-900 scale-95' : 'active:scale-95'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                        <span className="text-xs font-medium leading-tight line-clamp-2">{t.name}</span>
                        {sel && (
                          <span className="absolute top-1 right-1">
                            <CheckIcon className="w-3.5 h-3.5 text-[var(--primary-600)]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TagSelect;
