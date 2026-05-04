export const PIN_LENGTH = 6;

const SALT_KEY        = 'pinSalt';
const HASH_KEY        = 'pinHash';
const ENABLED_KEY     = 'pinEnabled';
const TIMEOUT_KEY     = 'lockTimeout';   // minutes; 0 = never
const LAST_ACTIVE_KEY = 'lastActive';

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

export const verifyPin = async (pin) => {
  const salt   = localStorage.getItem(SALT_KEY);
  const stored = localStorage.getItem(HASH_KEY);
  if (!salt || !stored) return false;
  return (await hashPin(pin, salt)) === stored;
};

export const disablePin = () => {
  localStorage.removeItem(SALT_KEY);
  localStorage.removeItem(HASH_KEY);
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
