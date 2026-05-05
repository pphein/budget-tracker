import { openDB } from 'idb';

const DB_NAME    = 'BudgetTrackerDB';
const DB_VERSION = 1;

const DEFAULT_TAGS = [
  // Income
  { name: 'Salary',           type: 'income',  colorIndex: 1 },
  { name: 'Overtime Pay',     type: 'income',  colorIndex: 2 },
  { name: 'Passive Income',   type: 'income',  colorIndex: 3 },
  // Expense
  { name: 'Taxi Fee',         type: 'expense', colorIndex: 0 },
  { name: 'Food & Dining',    type: 'expense', colorIndex: 1 },
  { name: 'Groceries',        type: 'expense', colorIndex: 2 },
  { name: 'Transportation',   type: 'expense', colorIndex: 3 },
  { name: 'Fuel',             type: 'expense', colorIndex: 4 },
  { name: 'Rent',             type: 'expense', colorIndex: 5 },
  { name: 'Utilities',        type: 'expense', colorIndex: 6 },
  { name: 'Electricity',      type: 'expense', colorIndex: 7 },
  { name: 'Water Bill',       type: 'expense', colorIndex: 8 },
  { name: 'Internet',         type: 'expense', colorIndex: 9 },
  { name: 'Phone Bill',       type: 'expense', colorIndex: 0 },
  { name: 'Healthcare',       type: 'expense', colorIndex: 1 },
  { name: 'Medicine',         type: 'expense', colorIndex: 2 },
  { name: 'Insurance',        type: 'expense', colorIndex: 3 },
  { name: 'Education',        type: 'expense', colorIndex: 4 },
  { name: 'Entertainment',    type: 'expense', colorIndex: 5 },
  { name: 'Shopping',         type: 'expense', colorIndex: 6 },
  { name: 'Clothing',         type: 'expense', colorIndex: 7 },
  { name: 'Personal Care',    type: 'expense', colorIndex: 8 },
  { name: 'Gym',              type: 'expense', colorIndex: 9 },
  { name: 'Travel',           type: 'expense', colorIndex: 0 },
  { name: 'Hotel',            type: 'expense', colorIndex: 1 },
  { name: 'Dining Out',       type: 'expense', colorIndex: 2 },
  { name: 'Coffee',           type: 'expense', colorIndex: 3 },
  { name: 'Subscriptions',    type: 'expense', colorIndex: 4 },
  { name: 'Home Maintenance', type: 'expense', colorIndex: 5 },
  { name: 'Repairs',          type: 'expense', colorIndex: 6 },
  { name: 'Childcare',        type: 'expense', colorIndex: 7 },
  { name: 'Pet Care',         type: 'expense', colorIndex: 8 },
  { name: 'Donations',        type: 'expense', colorIndex: 9 },
  { name: 'Snacks',           type: 'expense', colorIndex: 0 },
];

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

export const initDB = async () => {
  const db = await getDB();
  const existing = await db.getAll('tags');
  if (existing.length === 0) {
    const tx = db.transaction('tags', 'readwrite');
    await Promise.all(DEFAULT_TAGS.map((t) => tx.store.add(t)));
    await tx.done;
  }
  return db;
};

// ─── Transactions ──────────────────────────────────────────────────────────────
export const getTransactions = async () => {
  const db = await initDB();
  return db.getAll('transactions');
};

export const addTransaction = async ({ type, tag, amount, date }) => {
  const db = await initDB();
  await db.add('transactions', { type, tag, amount: parseFloat(amount), date });
};

export const editTransaction = async (id, updates) => {
  const db = await initDB();
  const existing = await db.get('transactions', id);
  if (!existing) throw new Error(`Transaction ${id} not found`);
  await db.put('transactions', { ...existing, ...updates, id });
};

export const deleteTransaction = async (id) => {
  const db = await initDB();
  await db.delete('transactions', id);
};

// ─── Tags ──────────────────────────────────────────────────────────────────────
export const getTags = async () => {
  const db = await initDB();
  return db.getAll('tags');
};

export const addTag = async ({ name, type, colorIndex }) => {
  const db = await initDB();
  await db.add('tags', { name, type, colorIndex });
};

export const editTag = async (id, updates) => {
  const db = await initDB();
  const existing = await db.get('tags', id);
  if (!existing) return;
  const updated = { ...existing };
  if ('name'       in updates) updated.name       = updates.name;
  if ('colorIndex' in updates) updated.colorIndex = updates.colorIndex;
  await db.put('tags', updated);
};

export const deleteTag = async (id) => {
  const db = await initDB();
  await db.delete('tags', id);
};

export const syncDefaultTags = async () => {
  const db = await initDB();
  const existing     = await db.getAll('tags');
  const existingNames = existing.map((t) => t.name.toLowerCase());
  const missing      = DEFAULT_TAGS.filter((t) => !existingNames.includes(t.name.toLowerCase()));
  if (missing.length > 0) {
    const tx = db.transaction('tags', 'readwrite');
    await Promise.all(missing.map((t) => tx.store.add(t)));
    await tx.done;
  }
  return db.getAll('tags');
};
