import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TagSelect from './TagSelect';
import NumPad from './NumPad';

const compressImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const DateBtn = forwardRef(({ value, onClick, className }, ref) => (
  <button type="button" onClick={onClick} ref={ref} className={className}>
    {value}
  </button>
));

const EditTransactionModal = ({ isOpen, onClose, onSave, transaction, tags }) => {
  const [amount,     setAmount]     = useState('');
  const [tag,        setTag]        = useState('');
  const [date,       setDate]       = useState(null);
  const [notes,      setNotes]      = useState('');
  const [attachment, setAttachment] = useState('');
  const attachInputRef = useRef(null);

  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount ?? ''));
      setTag(transaction.tag ?? '');
      setDate(transaction.date ? new Date(transaction.date) : new Date());
      setNotes(transaction.notes ?? '');
      setAttachment(transaction.attachment ?? '');
    }
  }, [transaction]);

  const handleSave = () => {
    if (!amount) return;
    onSave(transaction.id, { amount: parseFloat(amount), tag, date: date?.toISOString(), notes, attachment });
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

          {/* Attachment */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Receipt Photo</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => attachInputRef.current?.click()}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium ${attachment ? 'border-[var(--primary-500)] text-[var(--primary-500)]' : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}
              >
                <CameraIcon className="w-4 h-4" />
                {attachment ? 'Change' : 'Add Photo'}
              </button>
              {attachment && (
                <button type="button" onClick={() => setAttachment('')} className="text-xs text-red-400">Remove</button>
              )}
              <input
                ref={attachInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setAttachment(await compressImage(file));
                  e.target.value = '';
                }}
              />
            </div>
            {attachment && (
              <img src={attachment} alt="receipt" className="mt-2 w-full max-h-36 object-cover rounded-xl" />
            )}
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
