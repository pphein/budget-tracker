import React, { useState } from 'react';
import { XMarkIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const SavingsGoalsModal = ({ isOpen, onClose, goals, onAdd, onDelete }) => {
  const [name, setName]         = useState('');
  const [target, setTarget]     = useState('');
  const [startDate, setStart]   = useState('');
  const [deadline, setDeadline] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!name || !target) return;
    onAdd({ name, targetAmount: parseFloat(target), startDate: startDate || null, deadline: deadline || null });
    setName(''); setTarget(''); setStart(''); setDeadline('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Savings Goals</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Add form */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">New Goal</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Goal name (e.g. Emergency Fund)"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
            />
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Target amount (MMK)"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 dark:text-gray-500">Count from</label>
                <input type="date" value={startDate} onChange={(e) => setStart(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 dark:text-gray-500">Deadline</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none" />
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!name || !target}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-medium disabled:opacity-40"
            >
              <PlusIcon className="w-4 h-4" /> Add Goal
            </button>
          </div>

          {/* Existing goals */}
          {goals.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">No goals yet.</p>
          ) : (
            <div className="space-y-2">
              {goals.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{g.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Target: {new Intl.NumberFormat().format(g.targetAmount)} MMK
                      {g.deadline ? ` · By ${new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ''}
                    </p>
                  </div>
                  <button onClick={() => onDelete(g.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavingsGoalsModal;
