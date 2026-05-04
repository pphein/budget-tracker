import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { migrateFromIndexedDB } from './db.migrate';

// ─── Default tags seeded on first install ─────────────────────────────────────
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

// ─── Schema ───────────────────────────────────────────────────────────────────
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS transactions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT    NOT NULL,
    tag        TEXT    NOT NULL,
    amount     REAL    NOT NULL,
    date       TEXT    NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tags (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    type       TEXT    NOT NULL,
    colorIndex INTEGER NOT NULL DEFAULT 0
  );
`;

// ─── Singleton connection ──────────────────────────────────────────────────────
const DB_NAME = 'budget_tracker';
const sqlite  = new SQLiteConnection(CapacitorSQLite);
let _db       = null;

export const initDB = async () => {
  if (_db) return _db;

  const { result: consistent } = await sqlite.checkConnectionsConsistency();
  const { result: isConn }     = await sqlite.isConnection(DB_NAME, false);

  if (consistent && isConn) {
    _db = await sqlite.retrieveConnection(DB_NAME, false);
  } else {
    _db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
  }

  await _db.open();
  await _db.execute(SCHEMA);

  // One-time migration from IndexedDB (no-op if already done or fresh install)
  await migrateFromIndexedDB(_db);

  // Seed defaults only if tags table is still empty after migration
  const { values } = await _db.query('SELECT COUNT(*) AS cnt FROM tags');
  if (values[0].cnt === 0) {
    await _db.executeSet(
      DEFAULT_TAGS.map((t) => ({
        statement: 'INSERT INTO tags (name, type, colorIndex) VALUES (?, ?, ?)',
        values: [t.name, t.type, t.colorIndex],
      }))
    );
  }

  return _db;
};

// ─── Transactions ──────────────────────────────────────────────────────────────
export const getTransactions = async () => {
  const db = await initDB();
  const { values } = await db.query('SELECT * FROM transactions ORDER BY date DESC');
  return values ?? [];
};

export const addTransaction = async ({ type, tag, amount, date }) => {
  const db = await initDB();
  await db.run(
    'INSERT INTO transactions (type, tag, amount, date) VALUES (?, ?, ?, ?)',
    [type, tag, parseFloat(amount), date]
  );
};

export const editTransaction = async (id, updates) => {
  const db = await initDB();
  // Fetch existing to merge (EditTransactionModal does not send `type`)
  const { values } = await db.query('SELECT * FROM transactions WHERE id=?', [id]);
  if (!values?.length) throw new Error(`Transaction ${id} not found`);
  const merged = { ...values[0], ...updates };
  await db.run(
    'UPDATE transactions SET type=?, tag=?, amount=?, date=? WHERE id=?',
    [merged.type, merged.tag, parseFloat(merged.amount), merged.date, id]
  );
};

export const deleteTransaction = async (id) => {
  const db = await initDB();
  await db.run('DELETE FROM transactions WHERE id=?', [id]);
};

// ─── Tags ──────────────────────────────────────────────────────────────────────
export const getTags = async () => {
  const db = await initDB();
  const { values } = await db.query('SELECT * FROM tags ORDER BY id ASC');
  return values ?? [];
};

export const addTag = async ({ name, type, colorIndex }) => {
  const db = await initDB();
  await db.run(
    'INSERT INTO tags (name, type, colorIndex) VALUES (?, ?, ?)',
    [name, type, colorIndex]
  );
};

export const editTag = async (id, updates) => {
  const db = await initDB();
  const allowed = ['name', 'colorIndex'];
  const keys    = Object.keys(updates).filter((k) => allowed.includes(k));
  if (!keys.length) return;
  const setClauses = keys.map((k) => `${k}=?`).join(', ');
  await db.run(
    `UPDATE tags SET ${setClauses} WHERE id=?`,
    [...keys.map((k) => updates[k]), id]
  );
};

export const deleteTag = async (id) => {
  const db = await initDB();
  await db.run('DELETE FROM tags WHERE id=?', [id]);
};

export const syncDefaultTags = async () => {
  const db = await initDB();
  const { values: existing } = await db.query('SELECT name FROM tags');
  const existingNames = (existing ?? []).map((t) => t.name.toLowerCase());
  const missing = DEFAULT_TAGS.filter((t) => !existingNames.includes(t.name.toLowerCase()));
  if (missing.length > 0) {
    await db.executeSet(
      missing.map((t) => ({
        statement: 'INSERT INTO tags (name, type, colorIndex) VALUES (?, ?, ?)',
        values: [t.name, t.type, t.colorIndex],
      }))
    );
  }
  const { values } = await db.query('SELECT * FROM tags ORDER BY id ASC');
  return values ?? [];
};
