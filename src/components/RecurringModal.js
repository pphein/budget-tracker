import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  getRecurring, addRecurring, editRecurring, deleteRecurring,
} from '../utils/recurring';

const FREQUENCIES = [
  { value: 'daily',   label: 'Daily'   },
  { value: 'weekly',  label: 'Weekly'  },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly',  label: 'Yearly'  },
];

const fmt = (n) => new Intl.NumberFormat().format(n);
const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  type: 'expense', tag: '', amount: '', frequency: 'monthly',
  nextDate: today(), notes: '',
};

const RecurringModal = ({ isOpen, onClose, allTags }) => {
  const [items,   setItems]   = useState([]);
  const [showing, setShowing] = useState(false); // showing add/edit form
  const [editId,  setEditId]  = useState(null);
  const [form,    setForm]    = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) { setItems(getRecurring()); setShowing(false); setEditId(null); }
  }, [isOpen]);

  const typeTags = allTags.filter((t) => t.type === form.type);
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setShowing(false);
    setEditId(null);
  };

  const handleSave = () => {
    if (!form.amount || !form.tag) return;
    const data = {
      type:      form.type,
      tag:       form.tag,
      amount:    parseFloat(form.amount),
      frequency: form.frequency,
      nextDate:  form.nextDate,
      notes:     form.notes,
    };
    if (editId != null) editRecurring(editId, data);
    else                addRecurring(data);
    setItems(getRecurring());
    resetForm();
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      type:      item.type,
      tag:       item.tag,
      amount:    String(item.amount),
      frequency: item.frequency,
      nextDate:  item.nextDate,
      notes:     item.notes || '',
    });
    setShowing(true);
  };

  const handleDelete = (id) => {
    deleteRecurring(id);
    setItems(getRecurring());
  };

  const handleToggleActive = (id, active) => {
    editRecurring(id, { active: !active });
    setItems(getRecurring());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">Recurring Transactions</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {/* Add / Edit form */}
        {showing ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {editId != null ? 'Edit Recurring' : 'New Recurring'}
            </h3>

            {/* Type toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {['income', 'expense'].map((t) => (
                <button
                  key={t}
                  onClick={() => { set('type', t); set('tag', ''); }}
                  className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                    form.type === t
                      ? t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tag */}
            <select
              value={form.tag}
              onChange={(e) => set('tag', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value="">Select tag…</option>
              {typeTags.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>

            {/* Amount */}
            <input
              type="number"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              placeholder="Amount"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
              min="0"
            />

            {/* Frequency */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => set('frequency', f.value)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    form.frequency === f.value
                      ? 'bg-[var(--primary-500)] text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Next date */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Start / Next date
              </label>
              <input
                type="date"
                value={form.nextDate}
                onChange={(e) => set('nextDate', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
              />
            </div>

            {/* Notes */}
            <input
              type="text"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Note (optional)"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
            />

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={resetForm}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.amount || !form.tag}
                className="flex-1 py-2.5 rounded-xl bg-[var(--primary-500)] disabled:opacity-40 text-white text-sm font-medium"
              >
                {editId != null ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setForm(EMPTY_FORM); setShowing(true); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm active:bg-gray-50 dark:active:bg-gray-800"
          >
            <PlusIcon className="w-4 h-4" />
            Add recurring transaction
          </button>
        )}

        {/* List */}
        {items.length === 0 && !showing && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
            No recurring transactions yet.
          </p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm flex gap-3 ${!item.active ? 'opacity-50' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                  item.type === 'income'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {item.type}
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {item.tag}
                </span>
              </div>
              <p className="text-base font-bold text-gray-800 dark:text-gray-100">
                {fmt(item.amount)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {FREQUENCIES.find((f) => f.value === item.frequency)?.label}
                {' · Next: '}{item.nextDate}
              </p>
              {item.notes ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.notes}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5 items-end">
              <button
                onClick={() => handleToggleActive(item.id, item.active)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  item.active
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {item.active ? 'On' : 'Off'}
              </button>
              <button
                onClick={() => handleEdit(item)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              >
                <PencilIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecurringModal;
