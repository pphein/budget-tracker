import React, { useState } from 'react';
import { XMarkIcon, TrashIcon, PlusIcon, BellIcon } from '@heroicons/react/24/outline';

const RemindersModal = ({ isOpen, onClose, reminders, onAdd, onDelete, onDismiss }) => {
  const [name, setName]   = useState('');
  const [date, setDate]   = useState('');
  const [amount, setAmt]  = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!name || !date) return;
    onAdd({ name, date, amount: amount ? parseFloat(amount) : null, notes });
    setName(''); setDate(''); setAmt(''); setNotes('');
  };

  const today = new Date().toISOString().slice(0, 10);
  const active   = reminders.filter((r) => !r.dismissed).sort((a, b) => a.date.localeCompare(b.date));
  const overdue  = active.filter((r) => r.date < today);
  const upcoming = active.filter((r) => r.date >= today);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Bill Reminders</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Add form */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">New Reminder</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bill name (e.g. Rent)"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400">Due date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Amount (optional)</label>
                <input type="number" value={amount} onChange={(e) => setAmt(e.target.value)} placeholder="0"
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none" />
              </div>
            </div>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none" />
            <button onClick={handleAdd} disabled={!name || !date}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-medium disabled:opacity-40">
              <PlusIcon className="w-4 h-4" /> Add Reminder
            </button>
          </div>

          {/* Overdue */}
          {overdue.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Overdue</p>
              <div className="space-y-2">
                {overdue.map((r) => (
                  <ReminderRow key={r.id} r={r} onDismiss={onDismiss} onDelete={onDelete} overdue />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Upcoming</p>
              <div className="space-y-2">
                {upcoming.map((r) => (
                  <ReminderRow key={r.id} r={r} onDismiss={onDismiss} onDelete={onDelete} />
                ))}
              </div>
            </div>
          )}

          {active.length === 0 && (
            <div className="flex flex-col items-center py-8 text-gray-400 dark:text-gray-500">
              <BellIcon className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">No active reminders.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReminderRow = ({ r, onDismiss, onDelete, overdue }) => (
  <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${overdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
    <div>
      <p className={`text-sm font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>{r.name}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        {r.amount ? ` · ${new Intl.NumberFormat().format(r.amount)} MMK` : ''}
      </p>
    </div>
    <div className="flex gap-1">
      <button onClick={() => onDismiss(r.id)} className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">Done</button>
      <button onClick={() => onDelete(r.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default RemindersModal;
