import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid';
import { getTagColorClasses } from '../utils/tagColors';

// Multi-select searchable tag filter for record list
const Filter = ({ tags, allTags, selectedTags, setSelectedTags }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (name) =>
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  const getColor = (tagName) => {
    const found = allTags.find((t) => t.name === tagName);
    return found ? getTagColorClasses(found.colorIndex) : null;
  };

  return (
    <div className="relative mb-3" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(''); }}
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
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
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
                placeholder="Search tags…"
                className="flex-1 text-sm bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
              />
            </div>
          </div>

          {/* All Tags */}
          <button
            type="button"
            onClick={() => setSelectedTags([])}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
              selectedTags.length === 0 ? 'bg-primary-tint-subtle' : ''
            }`}
          >
            {selectedTags.length === 0
              ? <CheckIcon className="w-4 h-4 text-[var(--primary-500)] flex-shrink-0" />
              : <span className="w-4 flex-shrink-0" />}
            <span className="text-gray-700 dark:text-gray-200 text-xs font-medium">All Tags</span>
          </button>

          {/* Tag list */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-4 text-xs">No tags found</p>
            ) : (
              filtered.map((t) => {
                const c = getTagColorClasses(t.colorIndex);
                const sel = selectedTags.includes(t.name);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggle(t.name)}
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

export default Filter;
