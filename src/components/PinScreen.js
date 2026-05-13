import React, { useState, useEffect, useCallback } from 'react';
import PinPad from './PinPad';
import { verifyPin, PIN_LENGTH, MAX_FREE_ATTEMPTS, getFailCount, getLockoutRemaining } from '../utils/pin';

const fmt = (ms) => {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
};

const PinScreen = ({ onUnlock }) => {
  const [digits,     setDigits]     = useState('');
  const [error,      setError]      = useState('');
  const [shake,      setShake]      = useState(false);
  const [checking,   setChecking]   = useState(false);
  const [lockoutMs,  setLockoutMs]  = useState(() => getLockoutRemaining());
  const [failCount,  setFailCount]  = useState(() => getFailCount());

  // Countdown ticker while locked out
  useEffect(() => {
    if (lockoutMs <= 0) return;
    const id = setInterval(() => {
      const rem = getLockoutRemaining();
      setLockoutMs(rem);
      if (rem <= 0) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [lockoutMs > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const triggerShake = (msg) => {
    setShake(true);
    setError(msg);
    setDigits('');
    setTimeout(() => setShake(false), 600);
  };

  const handleKey = useCallback(async (key) => {
    if (checking || lockoutMs > 0) return;
    if (key === 'del') { setDigits((d) => d.slice(0, -1)); setError(''); return; }

    const next = digits + key;
    if (next.length > PIN_LENGTH) return;
    setDigits(next);

    if (next.length === PIN_LENGTH) {
      setChecking(true);
      const result = await verifyPin(next);
      setChecking(false);
      if (result.ok) {
        onUnlock();
      } else if (result.remainingMs > 0) {
        setLockoutMs(result.remainingMs);
        setFailCount(getFailCount());
        triggerShake('Too many attempts');
      } else {
        const fc = getFailCount();
        setFailCount(fc);
        const left = MAX_FREE_ATTEMPTS - fc;
        if (left <= 0) {
          triggerShake('Incorrect PIN');
        } else {
          triggerShake(left === 1 ? 'Incorrect PIN — 1 attempt left' : `Incorrect PIN — ${left} attempts left`);
        }
      }
    }
  }, [digits, checking, lockoutMs, onUnlock]);

  // Hardware keyboard support
  useEffect(() => {
    const onKey = (e) => {
      if (/^\d$/.test(e.key)) handleKey(e.key);
      else if (e.key === 'Backspace') handleKey('del');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleKey]);

  const attemptsLeft = MAX_FREE_ATTEMPTS - failCount;
  const warnAttempts = lockoutMs <= 0 && failCount > 0 && attemptsLeft > 0;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center px-6">
      {/* App identity */}
      <div className="mb-12 text-center">
        <h1 className="text-2xl font-bold text-white mb-1">Budget Tracker</h1>
        {lockoutMs > 0 ? (
          <p className="text-red-400 text-sm font-medium">
            Locked — try again in {fmt(lockoutMs)}
          </p>
        ) : (
          <p className="text-gray-500 text-sm">Enter your PIN to continue</p>
        )}
      </div>

      <PinPad
        digits={digits}
        onKey={handleKey}
        shake={shake}
        error={lockoutMs > 0 ? '' : error}
        title=""
        subtitle={`${PIN_LENGTH}-digit PIN`}
        disabled={lockoutMs > 0}
      />

      {warnAttempts && (
        <p className={`mt-6 text-xs font-medium ${attemptsLeft === 1 ? 'text-red-400' : 'text-yellow-400'}`}>
          {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout
        </p>
      )}
    </div>
  );
};

export default PinScreen;
