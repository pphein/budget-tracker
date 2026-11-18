import React, { useState, useEffect } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import { buildBackupEnvelope } from '../utils/backup';

const MIN_LENGTH = 6;

const BackupExportModal = ({ isOpen, onClose, onExported }) => {
  const [step, setStep] = useState('enter'); // 'enter' | 'confirm' | 'ready'
  const [password, setPassword] = useState('');
  const [input, setInput] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null); // { blob, filename }

  useEffect(() => {
    if (isOpen) {
      setStep('enter');
      setPassword('');
      setInput('');
      setError('');
      setBusy(false);
      setFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (input.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters`);
      return;
    }
    setPassword(input);
    setInput('');
    setError('');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (input !== password) {
      setError("Passwords don't match — try again");
      setInput('');
      setStep('enter');
      setPassword('');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const envelope = await buildBackupEnvelope(password);
      const filename = `budget-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const blob = new Blob([JSON.stringify(envelope)], { type: 'application/json' });
      setFile({ blob, filename });
      setStep('ready');
    } catch (e) {
      setError('Backup failed — please try again');
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async () => {
    const { saveAs } = await import('file-saver');
    saveAs(file.blob, file.filename);
    onExported?.();
  };

  const canShareFile = () => {
    if (!navigator.share || !navigator.canShare || !file) return false;
    try {
      const shareFile = new File([file.blob], file.filename, { type: 'application/json' });
      return navigator.canShare({ files: [shareFile] });
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    try {
      const shareFile = new File([file.blob], file.filename, { type: 'application/json' });
      await navigator.share({ files: [shareFile], title: 'Budget Tracker backup' });
      onExported?.();
    } catch {
      // user cancelled the share sheet — not an error
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 'enter') handleContinue();
    else if (step === 'confirm') handleConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Backup Data</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {step === 'ready' ? (
          <div className="px-4 py-5 space-y-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <LockClosedIcon className="w-8 h-8 text-emerald-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your backup is encrypted and ready.
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-semibold"
            >
              <ArrowDownTrayIcon className="w-4 h-4" /> Download
            </button>
            {canShareFile() && (
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold"
              >
                <ShareIcon className="w-4 h-4" /> Share…
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-2 text-xs text-gray-400 dark:text-gray-500"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <LockClosedIcon className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {step === 'enter'
                  ? 'Choose a password to encrypt your backup file. You’ll need it to restore this backup later.'
                  : 'Re-enter the password to confirm.'}
              </p>
            </div>

            <div className="relative">
              <input
                autoFocus
                type={showPw ? 'text' : 'password'}
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(''); }}
                placeholder={step === 'enter' ? 'Backup password' : 'Confirm password'}
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
              type="submit"
              disabled={busy || !input}
              className="w-full py-3 rounded-xl bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-semibold disabled:opacity-40"
            >
              {busy ? 'Encrypting…' : step === 'enter' ? 'Continue' : 'Encrypt & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BackupExportModal;
