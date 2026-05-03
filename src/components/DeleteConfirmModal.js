import React from 'react';
import { Dialog } from '@headlessui/react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, transaction }) => {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
          <Dialog.Title className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            Delete Transaction?
          </Dialog.Title>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            <span className="font-medium text-gray-700 dark:text-gray-300">{transaction.tag}</span>
            {' — '}
            {new Intl.NumberFormat().format(transaction.amount)}
            {' — '}
            {new Date(transaction.date).toLocaleDateString()}
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DeleteConfirmModal;
