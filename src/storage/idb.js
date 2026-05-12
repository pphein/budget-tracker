/**
 * IndexedDB backend via the `idb` library.
 */
import { openDB } from 'idb';
import { DEFAULT_TAGS } from './defaultTags';

const DB_NAME    = 'BudgetTrackerDB';
const DB_VERSION = 1;

let _db = null;

const getDB = async () => {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('tags')) {
        db.createObjectStore('tags', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  return _db;
};

const ensureSeeded = async (db) => {
  const existing = await db.getAll('tags');
  if (existing.length === 0) {
    const tx = db.transaction('tags', 'readwrite');
    await Promise.all(DEFAULT_TAGS.map((t) => tx.store.add(t)));
    await tx.done;
  }
};

// ── Tags ───────────────────────────────────────────────────────────────────────
export const getTags = async () => {
  const db = await getDB();
  await ensureSeeded(db);
  return db.getAll('tags');
};

export const addTag = async ({ name, type, colorIndex }) => {
  const db = await getDB();
  await db.add('tags', { name, type, colorIndex });
};

export const editTag = async (id, updates) => {
  const db       = await getDB();
  const existing = await db.get('tags', id);
  if (!existing) return;
  await db.put('tags', { ...existing, ...updates, id });
};

export const deleteTag = async (id) => {
  const db = await getDB();
  await db.delete('tags', id);
};

export const syncDefaultTags = async () => {
  const db           = await getDB();
  const existing     = await db.getAll('tags');
  const names        = existing.map((t) => t.name.toLowerCase());
  const missing      = DEFAULT_TAGS.filter((t) => !names.includes(t.name.toLowerCase()));
  if (missing.length > 0) {
    const tx = db.transaction('tags', 'readwrite');
    await Promise.all(missing.map((t) => tx.store.add(t)));
    await tx.done;
  }
  return db.getAll('tags');
};

// ── Transactions ───────────────────────────────────────────────────────────────
export const getTransactions = async () => {
  const db = await getDB();
  return db.getAll('transactions');
};

export const addTransaction = async ({ type, tag, amount, date, notes, currency, origAmount, attachment }) => {
  const db = await getDB();
  const record = { type, tag, amount: parseFloat(amount), date, notes: notes || '' };
  if (currency)           record.currency   = currency;
  if (origAmount != null) record.origAmount  = origAmount;
  if (attachment)         record.attachment  = attachment;
  await db.add('transactions', record);
};

export const editTransaction = async (id, updates) => {
  const db       = await getDB();
  const existing = await db.get('transactions', id);
  if (!existing) throw new Error(`Transaction ${id} not found`);
  await db.put('transactions', { ...existing, ...updates, id });
};

export const deleteTransaction = async (id) => {
  const db = await getDB();
  await db.delete('transactions', id);
};
