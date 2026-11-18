import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, ArrowUpTrayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { isValidEnvelope, restoreFromEnvelope } from '../utils/backup';

const BackupRestoreModal = ({ isOpen, onClose, onRestored }) => {
  const [step, setStep] = useState('pick'); // 'pick' | 'password' | 'confirm' | 'done'
  const [envelope, setEnvelope] = useState(null);
  const [fileName, setFileName] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('pick');
      setEnvelope(null);
      setFileName('');
      setPassword('');
      setError('');
      setBusy(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!isValidEnvelope(parsed)) {
          setError('This doesn’t look like a valid backup file');
          return;
        }
        setEnvelope(parsed);
        setFileName(file.name);
        setError('');
        setStep('password');
      } catch {
        setError('This doesn’t look like a valid backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = async () => {
    setBusy(true);
    setError('');
    try {
      await restoreFromEnvelope(envelope, password);
      setStep('done');
      onRestored?.();
    } catch (e) {
      if (e.message === 'INCORRECT_PASSWORD') {
        setError('Incorrect password');
        setStep('password');
      } else {
        setError('Restore failed — the file may be corrupted');
        setStep('pick');
        setEnvelope(null);
        setFileName('');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={step === 'confirm' ? undefined : onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Restore Backup</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-5 space-y-4">
          {step === 'pick' && (
            <>
              <label className="flex flex-col items-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-[var(--primary-400)]">
                <ArrowUpTrayIcon className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Tap to select a backup file</span>
                <input type="file" accept=".json,application/json" className="hidden" onChange={handleFile} />
              </label>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            </>
          )}

          {step === 'password' && (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Enter the password for <span className="font-medium text-gray-700 dark:text-gray-300">{fileName}</span>
              </p>
              <div className="relative">
                <input
                  autoFocus
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Backup password"
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[var(--primary-400)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              <button
                onClick={() => setStep('confirm')}
                disabled={!password}
                className="w-full py-3 rounded-xl bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-semibold disabled:opacity-40"
              >
                Continue
              </button>
            </>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Backup restored successfully</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Reload the app to see your restored data.</p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-semibold"
              >
                Reload App
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={step === 'confirm'} onClose={() => setStep('password')} className="relative z-[110]">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
              <Dialog.Title className="text-lg font-bold text-gray-800 dark:text-white">
                Replace all data?
              </Dialog.Title>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              This will permanently delete all current transactions, tags, goals, reminders, and other
              data on this device and replace them with the contents of this backup. This cannot be undone.
            </p>
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setStep('password')}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60"
              >
                {busy ? 'Restoring…' : 'Yes, replace everything'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default BackupRestoreModal;
