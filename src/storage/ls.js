/**
 * localStorage backend — works everywhere, no async setup needed.
 * Data keys: bt_tags, bt_transactions
 */
import { DEFAULT_TAGS } from './defaultTags';

const KEYS = { tags: 'bt_tags', transactions: 'bt_transactions' };

const load = (key) => {
  try { return JSON.parse(localStorage.getItem(KEYS[key]) || '[]'); }
  catch { return []; }
};

const save = (key, data) => localStorage.setItem(KEYS[key], JSON.stringify(data));

const nextId = (items) =>
  items.length === 0 ? 1 : Math.max(...items.map((i) => i.id || 0)) + 1;

// ── Seed on first use ──────────────────────────────────────────────────────────
const ensureSeeded = () => {
  const tags = load('tags');
  if (tags.length === 0) {
    let id = 1;
    save('tags', DEFAULT_TAGS.map((t) => ({ ...t, id: id++ })));
  }
};

// ── Tags ───────────────────────────────────────────────────────────────────────
export const getTags = async () => {
  ensureSeeded();
  return load('tags');
};

export const addTag = async ({ name, type, colorIndex }) => {
  const tags = load('tags');
  save('tags', [...tags, { id: nextId(tags), name, type, colorIndex }]);
};

export const editTag = async (id, updates) => {
  save('tags', load('tags').map((t) =>
    t.id === id ? { ...t, ...updates } : t
  ));
};

export const deleteTag = async (id) => {
  save('tags', load('tags').filter((t) => t.id !== id));
};

export const syncDefaultTags = async () => {
  ensureSeeded();
  const tags        = load('tags');
  const names       = tags.map((t) => t.name.toLowerCase());
  const missing     = DEFAULT_TAGS.filter((t) => !names.includes(t.name.toLowerCase()));
  if (missing.length > 0) {
    let maxId = nextId(tags) - 1;
    save('tags', [...tags, ...missing.map((t) => ({ ...t, id: ++maxId }))]);
  }
  return load('tags');
};

// ── Transactions ───────────────────────────────────────────────────────────────
export const getTransactions = async () => load('transactions');

export const addTransaction = async ({ type, tag, amount, date, notes }) => {
  const txs = load('transactions');
  save('transactions', [...txs, { id: nextId(txs), type, tag, amount: parseFloat(amount), date, notes: notes || '' }]);
};

export const editTransaction = async (id, updates) => {
  save('transactions', load('transactions').map((t) =>
    t.id === id ? { ...t, ...updates } : t
  ));
};

export const deleteTransaction = async (id) => {
  save('transactions', load('transactions').filter((t) => t.id !== id));
};
