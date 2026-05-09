import React, { useState } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid';
import { getTagColorClasses } from '../utils/tagColors';

// Multi-select tag filter — opens a bottom-sheet modal with a tag grid
const Filter = ({ tags, allTags, selectedTags, setSelectedTags }) => {
  const [open, setOpen] = useState(false);

  const toggle = (name) =>
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  const getColor = (tagName) => {
    const found = allTags.find((t) => t.name === tagName);
    return found ? getTagColorClasses(found.colorIndex) : null;
  };

  const handleClose = () => setOpen(false);

  return (
    <div className="mb-3">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 min-h-[40px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left"
      >
        {selectedTags.length === 0 ? (
          <span className="text-sm text-gray-400 flex-1">All Tags</span>
        ) : (
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedTags.map((name) => {
              const c = getColor(name);
              return (
                <span key={name} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c?.bg || 'bg-gray-100 dark:bg-gray-600'}`}>
                  {name}
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); toggle(name); }}
                    className="cursor-pointer"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </span>
                </span>
              );
            })}
          </div>
        )}
        <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {/* Bottom-sheet modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

          {/* Sheet */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl flex flex-col w-full max-w-sm max-h-[72vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Filter by Tag</h3>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Tag grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {/* All Tags chip */}
              <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className={`relative w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl mb-3 text-sm font-medium transition-all ${
                    selectedTags.length === 0
                      ? 'bg-[var(--primary-100)] dark:bg-[var(--primary-900)] ring-2 ring-[var(--primary-500)]'
                      : 'bg-gray-100 dark:bg-gray-800 active:scale-95'
                  }`}
                >
                  {selectedTags.length === 0 && (
                    <CheckIcon className="w-4 h-4 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
                  )}
                  <span className="text-gray-700 dark:text-gray-200">All Tags</span>
                </button>

              {tags.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">No tags found</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {tags.map((t) => {
                    const c   = getTagColorClasses(t.colorIndex);
                    const sel = selectedTags.includes(t.name);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggle(t.name)}
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

            {/* Done button */}
            <div className="px-4 pb-6 pt-2 flex-shrink-0 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white text-sm font-medium transition-colors"
              >
                {selectedTags.length === 0 ? 'Show All' : `Show ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
