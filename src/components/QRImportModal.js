import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { applyQrPayload } from '../utils/qrShare';
import { useLanguage } from '../i18n/LanguageContext';

const QRImportModal = ({ isOpen, onClose, onImported }) => {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) { setText(''); setError(''); setBusy(false); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImport = async () => {
    setBusy(true);
    setError('');
    try {
      await applyQrPayload(text.trim());
      onImported?.();
      onClose();
    } catch {
      setError('That doesn\'t look like a valid setup code');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">{t('qr.importTitle')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-5 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('qr.importDesc')}
          </p>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setError(''); }}
            rows={5}
            placeholder={t('qr.importPlaceholder')}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[var(--primary-400)] font-mono"
          />
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button
            onClick={handleImport}
            disabled={busy || !text.trim()}
            className="w-full py-3 rounded-xl bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-semibold disabled:opacity-40"
          >
            {busy ? 'Importing…' : t('qr.import')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRImportModal;
