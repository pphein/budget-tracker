import React, { useState, useEffect, forwardRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TagSelect from './TagSelect';
import NumPad from './NumPad';

const DateBtn = forwardRef(({ value, onClick, className }, ref) => (
  <button type="button" onClick={onClick} ref={ref} className={className}>
    {value}
  </button>
));

const EditTransactionModal = ({ isOpen, onClose, onSave, transaction, tags }) => {
  const [amount, setAmount] = useState('');
  const [tag,    setTag]    = useState('');
  const [date,   setDate]   = useState(null);
  const [notes,  setNotes]  = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount ?? ''));
      setTag(transaction.tag ?? '');
      setDate(transaction.date ? new Date(transaction.date) : new Date());
      setNotes(transaction.notes ?? '');
    }
  }, [transaction]);

  const handleSave = () => {
    if (!amount) return;
    onSave(transaction.id, { amount: parseFloat(amount), tag, date: date?.toISOString(), notes });
    onClose();
  };

  if (!isOpen || !transaction) return null;

  return (
    // z-[45] keeps edit modal below NumPad/TagSelect overlays at z-50
    <div className="fixed inset-0 z-[45] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Edit Transaction</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 pt-4 pb-5 space-y-4">
          {/* Tag */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Tag</label>
            <TagSelect tags={tags || []} value={tag} onChange={setTag} />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Date</label>
            <DatePicker
              selected={date}
              onChange={setDate}
              dateFormat="dd MMM yyyy"
              withPortal
              customInput={
                <DateBtn className="w-full text-left px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
              }
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Amount</label>
            <NumPad value={amount} onChange={setAmount} placeholder="Enter amount" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Note</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional note"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTransactionModal;
