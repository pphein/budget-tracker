/**
 * Storage router — delegates to the backend chosen in Settings.
 * Default: 'localStorage' (works everywhere, no async setup).
 * Alternative: 'indexedDB' (persists across origins, larger capacity).
 */
import * as ls  from './storage/ls';
import * as idb from './storage/idb';

export const STORAGE_KEY     = 'storageType';
export const STORAGE_OPTIONS = [
  { value: 'localStorage', label: 'Local Storage' },
  { value: 'indexedDB',    label: 'IndexedDB'     },
];

export const getStorageType = () =>
  localStorage.getItem(STORAGE_KEY) || 'localStorage';

export const setStorageType = (type) =>
  localStorage.setItem(STORAGE_KEY, type);

const store = () => getStorageType() === 'indexedDB' ? idb : ls;

// ── Tags ───────────────────────────────────────────────────────────────────────
export const getTags          = (...a) => store().getTags(...a);
export const addTag           = (...a) => store().addTag(...a);
export const editTag          = (...a) => store().editTag(...a);
export const deleteTag        = (...a) => store().deleteTag(...a);
export const syncDefaultTags  = (...a) => store().syncDefaultTags(...a);

// ── Transactions ───────────────────────────────────────────────────────────────
export const getTransactions  = (...a) => store().getTransactions(...a);
export const addTransaction   = (...a) => store().addTransaction(...a);
export const editTransaction  = (...a) => store().editTransaction(...a);
export const deleteTransaction= (...a) => store().deleteTransaction(...a);
