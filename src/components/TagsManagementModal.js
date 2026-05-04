import React, { useState, useEffect } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getTagColorClasses } from '../utils/tagColors';
import { COLOR_THEMES } from '../utils/colorTheme';

const TagsManagementModal = ({ isOpen, onClose, allTags, onAdd, onDelete, onEdit, onSync, activeType, colorTheme, onColorThemeChange }) => {
  const [section, setSection]         = useState('tags'); // 'tags' | 'theme'
  const [tabType, setTabType]         = useState(activeType || 'income');
  const [newTagName, setNewTagName]   = useState('');
  const [editingId, setEditingId]     = useState(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError]             = useState('');

  useEffect(() => {
    if (isOpen) { setTabType(activeType || 'income'); setSection('tags'); }
  }, [isOpen, activeType]);

  const typeTags = allTags.filter((t) => t.type === tabType);

  const handleAdd = async () => {
    const name = newTagName.trim();
    if (!name) return;
    if (allTags.some((t) => t.name.toLowerCase() === name.toLowerCase() && t.type === tabType)) {
      setError('Tag already exists'); return;
    }
    setError('');
    await onAdd({ name, type: tabType });
    setNewTagName('');
  };

  const startEdit = (tag) => { setEditingId(tag.id); setEditingName(tag.name); setError(''); };

  const saveEdit = async (tag) => {
    const name = editingName.trim();
    if (!name) return;
    if (allTags.some((t) => t.name.toLowerCase() === name.toLowerCase() && t.type === tabType && t.id !== tag.id)) {
      setError('Tag name already exists'); return;
    }
    setError('');
    await onEdit(tag.id, { name });
    setEditingId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Settings</h2>
        <div className="flex items-center gap-1">
          {section === 'tags' && (
            <button
              onClick={onSync}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50"
              title="Sync default tags"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" />
              Sync
            </button>
          )}
          <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Top section tabs: Tags | Theme */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {[['tags','Tags'],['theme','Theme']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              section === id
                ? 'border-b-2 border-blue-500 text-blue-500 bg-white dark:bg-gray-900'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── TAGS SECTION ── */}
      {section === 'tags' && (
        <>
          {/* Income / Expense sub-tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['income', 'expense'].map((type) => (
              <button
                key={type}
                onClick={() => { setTabType(type); setError(''); setEditingId(null); }}
                className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                  tabType === type
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Tag list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {typeTags.length === 0 && (
              <p className="text-center text-gray-400 dark:text-gray-500 mt-10 text-sm">
                No {tabType} tags yet. Add one below.
              </p>
            )}
            {typeTags.map((tag) => {
              const colors = getTagColorClasses(tag.colorIndex);
              return (
                <div key={tag.id} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colors.dot}`} />
                  {editingId === tag.id ? (
                    <>
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(tag)}
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        autoFocus
                      />
                      <button onClick={() => saveEdit(tag)} className="p-1 text-green-500 hover:text-green-600">
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-500">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`flex-1 text-sm px-2 py-0.5 rounded-full font-medium ${colors.bg}`}>
                        {tag.name}
                      </span>
                      <button onClick={() => startEdit(tag)} className="p-1 text-blue-400 hover:text-blue-500">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(tag.id)} className="p-1 text-red-400 hover:text-red-500">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add new tag */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => { setNewTagName(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder={`New ${tabType} tag`}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button onClick={handleAdd} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
                Add
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── THEME SECTION ── */}
      {section === 'theme' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* Accent color */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Accent Color</h3>
            <div className="grid grid-cols-4 gap-3">
              {COLOR_THEMES.map((t) => {
                const active = colorTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onColorThemeChange(t.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      active
                        ? 'border-gray-800 dark:border-white scale-105'
                        : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                    }`}
                  >
                    <span
                      className="w-9 h-9 rounded-full shadow-sm"
                      style={{ backgroundColor: t.colors[500] }}
                    />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{t.label}</span>
                    {active && <CheckIcon className="w-3.5 h-3.5 text-gray-700 dark:text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Preview</h3>
            <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <button className="w-full py-2 rounded-lg bg-blue-500 text-white text-sm font-medium">
                Primary Button
              </button>
              <div className="flex gap-2">
                {['Jan','Feb','Mar'].map((m) => (
                  <button key={m} className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white">{m}</button>
                ))}
                <button className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Apr</button>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Tag Badge</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsManagementModal;
