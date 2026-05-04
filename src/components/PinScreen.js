import React, { useState, useEffect, useCallback } from 'react';
import PinPad from './PinPad';
import { verifyPin, PIN_LENGTH } from '../utils/pin';

const PinScreen = ({ onUnlock }) => {
  const [digits,   setDigits]   = useState('');
  const [error,    setError]    = useState('');
  const [shake,    setShake]    = useState(false);
  const [checking, setChecking] = useState(false);

  const triggerShake = (msg) => {
    setShake(true);
    setError(msg);
    setDigits('');
    setTimeout(() => setShake(false), 600);
  };

  const handleKey = useCallback(async (key) => {
    if (checking) return;
    if (key === 'del') { setDigits((d) => d.slice(0, -1)); setError(''); return; }

    const next = digits + key;
    if (next.length > PIN_LENGTH) return;
    setDigits(next);

    if (next.length === PIN_LENGTH) {
      setChecking(true);
      const ok = await verifyPin(next);
      setChecking(false);
      if (ok) {
        onUnlock();
      } else {
        triggerShake('Incorrect PIN');
      }
    }
  }, [digits, checking, onUnlock]);

  // Hardware keyboard support
  useEffect(() => {
    const onKey = (e) => {
      if (/^\d$/.test(e.key)) handleKey(e.key);
      else if (e.key === 'Backspace') handleKey('del');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleKey]);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center px-6">
      {/* App identity */}
      <div className="mb-12 text-center">
        <h1 className="text-2xl font-bold text-white mb-1">Budget Tracker</h1>
        <p className="text-gray-500 text-sm">Enter your PIN to continue</p>
      </div>

      <PinPad
        digits={digits}
        onKey={handleKey}
        shake={shake}
        error={error}
        title=""
        subtitle={`${PIN_LENGTH}-digit PIN`}
      />
    </div>
  );
};

export default PinScreen;
