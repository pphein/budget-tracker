const KEY = 'bt_debts';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
};

const save = (debts) => { localStorage.setItem(KEY, JSON.stringify(debts)); return debts; };

export const getDebts = () => load();

export const addDebt = (d) =>
  save([...load(), { ...d, paidAmount: 0, id: Date.now() }]);

export const updateDebt = (id, updates) =>
  save(load().map((d) => (d.id === id ? { ...d, ...updates } : d)));

export const deleteDebt = (id) => save(load().filter((d) => d.id !== id));

export const logPayment = (id, amount) =>
  save(load().map((d) => (d.id === id ? { ...d, paidAmount: (d.paidAmount || 0) + amount } : d)));
