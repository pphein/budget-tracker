import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PinPad from './PinPad';
import { setPin as savePin, verifyPin, PIN_LENGTH } from '../utils/pin';

/**
 * mode='setup'  — set a new PIN (enter × 2)
 * mode='change' — verify current PIN, then set new PIN (enter × 2)
 */
const PinSetupModal = ({ isOpen, onClose, mode = 'setup', onSuccess }) => {
  const [step,      setStep]      = useState('enter');   // 'verify'|'enter'|'confirm'
  const [digits,    setDigits]    = useState('');
  const [newPin,    setNewPin]    = useState('');
  const [error,     setError]     = useState('');
  const [shake,     setShake]     = useState(false);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(mode === 'change' ? 'verify' : 'enter');
      setDigits('');
      setNewPin('');
      setError('');
    }
  }, [isOpen, mode]);

  const triggerShake = (msg) => {
    setShake(true);
    setError(msg);
    setDigits('');
    setTimeout(() => setShake(false), 600);
  };

  const handleKey = useCallback(async (key) => {
    if (saving) return;
    if (key === 'del') { setDigits((d) => d.slice(0, -1)); setError(''); return; }

    const next = digits + key;
    if (next.length > PIN_LENGTH) return;
    setDigits(next);

    if (next.length < PIN_LENGTH) return;

    // — Verify step (change mode): check current PIN —
    if (step === 'verify') {
      const ok = await verifyPin(next);
      if (ok) {
        setStep('enter');
        setDigits('');
        setError('');
      } else {
        triggerShake('Incorrect PIN');
      }
      return;
    }

    // — Enter step: store and ask to confirm —
    if (step === 'enter') {
      setNewPin(next);
      setStep('confirm');
      setDigits('');
      setError('');
      return;
    }

    // — Confirm step: compare —
    if (next === newPin) {
      setSaving(true);
      await savePin(next);
      setSaving(false);
      onSuccess?.();
      onClose();
    } else {
      triggerShake("PINs don't match — try again");
      setStep('enter');
      setNewPin('');
    }
  }, [digits, step, newPin, saving, onSuccess, onClose]);

  // Hardware keyboard support
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (/^\d$/.test(e.key)) handleKey(e.key);
      else if (e.key === 'Backspace') handleKey('del');
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleKey, onClose]);

  if (!isOpen) return null;

  const titles = {
    verify:  'Enter current PIN',
    enter:   mode === 'setup' ? 'Set a new PIN' : 'Enter new PIN',
    confirm: 'Confirm new PIN',
  };

  const stepIndex = { verify: 0, enter: mode === 'change' ? 1 : 0, confirm: mode === 'change' ? 2 : 1 };
  const totalSteps = mode === 'change' ? 3 : 2;

  return (
    <div className="fixed inset-0 z-[110] bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="text-base font-semibold text-white">
          {mode === 'setup' ? 'Set PIN' : 'Change PIN'}
        </h2>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1.5 px-4 pt-4">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= stepIndex[step] ? 'bg-[var(--primary-500)]' : 'bg-gray-800'
            }`}
          />
        ))}
      </div>

      {/* Pin pad */}
      <div className="flex-1 flex items-center justify-center">
        <PinPad
          digits={digits}
          onKey={handleKey}
          shake={shake}
          error={error}
          title={titles[step]}
          subtitle={`${PIN_LENGTH} digits`}
        />
      </div>
    </div>
  );
};

export default PinSetupModal;
