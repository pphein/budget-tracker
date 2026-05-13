export const PIN_LENGTH        = 6;
export const MAX_FREE_ATTEMPTS = 5;

const SALT_KEY        = 'pinSalt';
const HASH_KEY        = 'pinHash';
const ENABLED_KEY     = 'pinEnabled';
const TIMEOUT_KEY     = 'lockTimeout';   // minutes; 0 = never
const LAST_ACTIVE_KEY = 'lastActive';
const FAIL_COUNT_KEY    = 'pinFailCount';
const LOCKOUT_UNTIL_KEY = 'pinLockoutUntil';

// Lockout durations (seconds) for the 5th, 6th, 7th, 8th, 9th+ failure
const LOCKOUT_DURATIONS_S = [30, 60, 120, 300, 900];

// ─── Brute-force helpers ──────────────────────────────────────────────────────
export const getFailCount = () =>
  parseInt(localStorage.getItem(FAIL_COUNT_KEY) || '0');

/** Returns remaining lockout in ms (0 = not locked). */
export const getLockoutRemaining = () =>
  Math.max(0, parseInt(localStorage.getItem(LOCKOUT_UNTIL_KEY) || '0') - Date.now());

// ─── Internal helpers ─────────────────────────────────────────────────────────
const generateSalt = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
};

const hashPin = async (pin, salt) => {
  const data   = new TextEncoder().encode(pin + salt);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

// ─── Public API ───────────────────────────────────────────────────────────────
export const isPinEnabled = () => localStorage.getItem(ENABLED_KEY) === 'true';

export const setPin = async (pin) => {
  const salt = generateSalt();
  const hash = await hashPin(pin, salt);
  localStorage.setItem(SALT_KEY, salt);
  localStorage.setItem(HASH_KEY, hash);
  localStorage.setItem(ENABLED_KEY, 'true');
};

/**
 * Returns { ok: true } on success, or
 * { ok: false, remainingMs: number } on failure/lockout.
 * remainingMs > 0 means the app is currently locked out.
 */
export const verifyPin = async (pin) => {
  // Refuse while locked out
  const remaining = getLockoutRemaining();
  if (remaining > 0) return { ok: false, remainingMs: remaining };

  const salt   = localStorage.getItem(SALT_KEY);
  const stored = localStorage.getItem(HASH_KEY);
  if (!salt || !stored) return { ok: false, remainingMs: 0 };

  const ok = (await hashPin(pin, salt)) === stored;

  if (ok) {
    localStorage.removeItem(FAIL_COUNT_KEY);
    localStorage.removeItem(LOCKOUT_UNTIL_KEY);
    return { ok: true, remainingMs: 0 };
  }

  // Record failure and apply lockout if threshold reached
  const fails = getFailCount() + 1;
  localStorage.setItem(FAIL_COUNT_KEY, String(fails));

  if (fails >= MAX_FREE_ATTEMPTS) {
    const idx    = Math.min(fails - MAX_FREE_ATTEMPTS, LOCKOUT_DURATIONS_S.length - 1);
    const lockMs = LOCKOUT_DURATIONS_S[idx] * 1000;
    localStorage.setItem(LOCKOUT_UNTIL_KEY, String(Date.now() + lockMs));
    return { ok: false, remainingMs: lockMs };
  }

  return { ok: false, remainingMs: 0 };
};

export const disablePin = () => {
  localStorage.removeItem(SALT_KEY);
  localStorage.removeItem(HASH_KEY);
  localStorage.removeItem(FAIL_COUNT_KEY);
  localStorage.removeItem(LOCKOUT_UNTIL_KEY);
  localStorage.setItem(ENABLED_KEY, 'false');
};

// ─── Auto-lock ────────────────────────────────────────────────────────────────
export const getLockTimeout  = () => parseInt(localStorage.getItem(TIMEOUT_KEY) ?? '5');
export const setLockTimeout  = (mins) => localStorage.setItem(TIMEOUT_KEY, String(mins));
export const recordActivity  = () => localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));

export const shouldLockNow = () => {
  if (!isPinEnabled()) return false;
  const mins = getLockTimeout();
  if (mins === 0) return false;
  const last = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0');
  return Date.now() - last > mins * 60 * 1000;
};
