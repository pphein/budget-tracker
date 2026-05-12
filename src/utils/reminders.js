const KEY = 'bt_reminders';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
};

const save = (r) => { localStorage.setItem(KEY, JSON.stringify(r)); return r; };

export const getReminders    = () => load();
export const addReminder     = (r) => save([...load(), { ...r, id: Date.now(), dismissed: false }]);
export const dismissReminder = (id) => save(load().map((r) => (r.id === id ? { ...r, dismissed: true } : r)));
export const deleteReminder  = (id) => save(load().filter((r) => r.id !== id));
