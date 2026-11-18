/**
 * Encrypted backup/restore — AES-GCM payload, PBKDF2-derived key.
 * Scope: tags + transactions (via db.js) plus the user-authored localStorage
 * keys below. Deliberately excludes device-local state: storageType, PIN
 * credentials, and disposable price/rate caches.
 */
import { getTags, getTransactions, addTag, addTransaction, clearTags, clearTransactions } from '../db';

export const BACKUP_VERSION = 1;
const PBKDF2_ITERATIONS = 250000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

const INCLUDED_JSON_KEYS = {
  goals: 'bt_goals',
  reminders: 'bt_reminders',
  templates: 'bt_templates',
  recurring: 'bt_recurring',
  budgetLimits: 'bt_budget_limits',
  taxSettings: 'taxSettings',
  goldPrices: 'goldPrices',
  accounts: 'bt_accounts',
  debts: 'bt_debts',
  assets: 'bt_assets',
};

const INCLUDED_STRING_KEYS = [
  'colorTheme', 'theme', 'goldApiKey',
  'showGoldBar', 'showExchangeBar', 'showGoldChart', 'showExchangeChart',
  'showOilChart', 'showCurrencyConverter', 'showHealthScore',
  'featureRecurring', 'featureSplit', 'featureTemplates', 'featureBudgetLimits',
  'featureCSVImport', 'featureSearchNotes', 'featureTagFilter', 'featureAccounts',
  'featureDebtTracker', 'featureNetWorth', 'featureQuickAdd', 'language',
];

// ─── base64 helpers (chunked — avoids call-stack overflow on large payloads,
// e.g. transactions carrying base64 photo attachments) ─────────────────────
const CHUNK = 0x8000;

const bytesToBase64 = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
};

const base64ToBytes = (b64) => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

// ─── crypto ─────────────────────────────────────────────────────────────────
const deriveKey = async (password, saltBytes, iterations, usages) => {
  const baseKey = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    usages
  );
};

const encryptJSON = async (data, password) => {
  const saltBytes = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const ivBytes = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(password, saltBytes, PBKDF2_ITERATIONS, ['encrypt']);
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: ivBytes }, key, plaintext);
  return {
    salt: bytesToBase64(saltBytes),
    iv: bytesToBase64(ivBytes),
    ciphertext: bytesToBase64(new Uint8Array(cipherBuf)),
  };
};

const decryptJSON = async ({ salt, iv, ciphertext, iterations }, password) => {
  const key = await deriveKey(password, base64ToBytes(salt), iterations, ['decrypt']);
  let plainBuf;
  try {
    plainBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(iv) }, key, base64ToBytes(ciphertext)
    );
  } catch {
    // AES-GCM auth-tag check failed: wrong password or corrupted file.
    throw new Error('INCORRECT_PASSWORD');
  }
  return JSON.parse(new TextDecoder().decode(plainBuf));
};

// ─── backup payload ───────────────────────────────────────────────────────
const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const collectBackupData = async () => {
  const [tags, transactions] = await Promise.all([getTags(), getTransactions()]);
  const data = { tags, transactions };

  data.goals = readJSON(INCLUDED_JSON_KEYS.goals, []);
  data.reminders = readJSON(INCLUDED_JSON_KEYS.reminders, []);
  data.templates = readJSON(INCLUDED_JSON_KEYS.templates, []);
  data.recurring = readJSON(INCLUDED_JSON_KEYS.recurring, []);
  data.budgetLimits = readJSON(INCLUDED_JSON_KEYS.budgetLimits, {});
  data.taxSettings = readJSON(INCLUDED_JSON_KEYS.taxSettings, null);
  data.goldPrices = readJSON(INCLUDED_JSON_KEYS.goldPrices, null);
  data.accounts = readJSON(INCLUDED_JSON_KEYS.accounts, []);
  data.debts = readJSON(INCLUDED_JSON_KEYS.debts, []);
  data.assets = readJSON(INCLUDED_JSON_KEYS.assets, []);

  INCLUDED_STRING_KEYS.forEach((key) => { data[key] = localStorage.getItem(key); });

  return data;
};

export const buildBackupEnvelope = async (password) => {
  const data = await collectBackupData();
  const { salt, iv, ciphertext } = await encryptJSON(data, password);
  return {
    app: 'budget-tracker-backup',
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    iterations: PBKDF2_ITERATIONS,
    salt, iv, ciphertext,
  };
};

export const isValidEnvelope = (envelope) =>
  !!envelope &&
  envelope.app === 'budget-tracker-backup' &&
  envelope.version === BACKUP_VERSION &&
  typeof envelope.salt === 'string' &&
  typeof envelope.iv === 'string' &&
  typeof envelope.ciphertext === 'string';

export const restoreFromEnvelope = async (envelope, password) => {
  if (!isValidEnvelope(envelope)) throw new Error('INVALID_FILE');

  // Decrypt first — if this throws, nothing below has run yet, so a wrong
  // password or corrupted file never wipes existing data.
  const data = await decryptJSON(envelope, password);

  await Promise.all([clearTags(), clearTransactions()]);
  await Promise.all((data.tags || []).map((t) =>
    addTag({ name: t.name, type: t.type, colorIndex: t.colorIndex })));
  await Promise.all((data.transactions || []).map((t) =>
    addTransaction({
      type: t.type, tag: t.tag, amount: t.amount, date: t.date, notes: t.notes,
      currency: t.currency, origAmount: t.origAmount, attachment: t.attachment,
      deletedAt: t.deletedAt, accountId: t.accountId,
    })));

  const writeJSON = (key, val, fallback) =>
    localStorage.setItem(key, JSON.stringify(val !== undefined ? val : fallback));

  writeJSON(INCLUDED_JSON_KEYS.goals, data.goals, []);
  writeJSON(INCLUDED_JSON_KEYS.reminders, data.reminders, []);
  writeJSON(INCLUDED_JSON_KEYS.templates, data.templates, []);
  writeJSON(INCLUDED_JSON_KEYS.recurring, data.recurring, []);
  writeJSON(INCLUDED_JSON_KEYS.budgetLimits, data.budgetLimits, {});
  if (data.taxSettings != null) writeJSON(INCLUDED_JSON_KEYS.taxSettings, data.taxSettings, null);
  if (data.goldPrices != null) writeJSON(INCLUDED_JSON_KEYS.goldPrices, data.goldPrices, null);
  writeJSON(INCLUDED_JSON_KEYS.accounts, data.accounts, []);
  writeJSON(INCLUDED_JSON_KEYS.debts, data.debts, []);
  writeJSON(INCLUDED_JSON_KEYS.assets, data.assets, []);

  INCLUDED_STRING_KEYS.forEach((key) => {
    if (data[key] != null) localStorage.setItem(key, data[key]);
  });

  // Deliberately never touched: storageType, pinSalt/pinHash/pinEnabled/
  // lockTimeout/lastActive/pinFailCount/pinLockoutUntil, and the
  // exchangeRates*/goldPriceHistory/oilPriceHistory API caches.
};
