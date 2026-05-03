import React, { useEffect } from 'react';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/24/solid';

const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 2000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isDelete = toast.type === 'delete';
  return (
    <div
      className={`fixed bottom-20 left-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-slide-up ${
        isDelete ? 'bg-red-500' : 'bg-green-500'
      }`}
    >
      {isDelete
        ? <TrashIcon className="w-4 h-4 flex-shrink-0" />
        : <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />}
      {toast.message}
    </div>
  );
};

export default Toast;
