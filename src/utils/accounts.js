const KEY = 'bt_accounts';

export const DEFAULT_ACCOUNT_ID = 'cash';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
};

const save = (accounts) => { localStorage.setItem(KEY, JSON.stringify(accounts)); return accounts; };

const ensureSeeded = () => {
  const accounts = load();
  if (accounts.length === 0) {
    return save([{ id: DEFAULT_ACCOUNT_ID, name: 'Cash', colorIndex: 0, archived: false }]);
  }
  return accounts;
};

export const getAccounts = () => ensureSeeded();

export const addAccount = (a) => {
  const accounts = ensureSeeded();
  return save([...accounts, { ...a, id: Date.now(), archived: false }]);
};

export const updateAccount = (id, updates) =>
  save(ensureSeeded().map((a) => (a.id === id ? { ...a, ...updates } : a)));

export const archiveAccount = (id) => updateAccount(id, { archived: true });
export const unarchiveAccount = (id) => updateAccount(id, { archived: false });

export const deleteAccount = (id) => save(ensureSeeded().filter((a) => a.id !== id));
