import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid';
import { getTagColorClasses } from '../utils/tagColors';

// Single-select searchable tag dropdown for transaction form
const TagSelect = ({ tags, value, onChange, placeholder = 'Select a tag…' }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  const selected = tags.find((t) => t.name === value);
  const selectedColor = selected ? getTagColorClasses(selected.colorIndex) : null;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(''); }}
        className="relative w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2.5 pl-3 pr-10 text-left text-sm text-gray-800 dark:text-gray-200"
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
          <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="flex-1 text-sm bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-4 text-xs">No tags found</p>
            ) : (
              filtered.map((t) => {
                const c = getTagColorClasses(t.colorIndex);
                const sel = t.name === value;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { onChange(t.name); setOpen(false); setSearch(''); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${sel ? 'bg-primary-tint-subtle' : ''}`}
                  >
                    {sel
                      ? <CheckIcon className="w-4 h-4 text-[var(--primary-500)] flex-shrink-0" />
                      : <span className="w-4 flex-shrink-0" />}
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {t.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelect;
