import React, { useState, useEffect } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getTagColorClasses } from '../utils/tagColors';

const TagsManagementModal = ({ isOpen, onClose, allTags, onAdd, onDelete, onEdit, onSync, activeType }) => {
  const [tabType, setTabType]         = useState(activeType || 'income');
  const [newTagName, setNewTagName]   = useState('');
  const [editingId, setEditingId]     = useState(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError]             = useState('');

  useEffect(() => {
    if (isOpen) { setTabType(activeType || 'income'); }
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
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Manage Tags</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onSync}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-tint text-[var(--primary-600)] dark:text-[var(--primary-400)] text-xs font-medium hover:bg-[var(--primary-100)] dark:hover:bg-[var(--primary-800)]"
            title="Sync default tags"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            Sync
          </button>
          <button onClick={onClose} className="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Income / Expense sub-tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {['income', 'expense'].map((type) => (
          <button
            key={type}
            onClick={() => { setTabType(type); setError(''); setEditingId(null); }}
            className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
              tabType === type
                ? 'border-b-2 text-[var(--primary-500)]'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            style={tabType === type ? { borderBottomColor: 'var(--primary-500)' } : {}}
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
                  <button onClick={() => startEdit(tag)} className="p-1 text-[var(--primary-400)] hover:text-[var(--primary-500)]">
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
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-[var(--primary-500)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-600)]"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagsManagementModal;
