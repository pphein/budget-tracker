const KEY = 'bt_recurring';

const load = () => {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
};

const save = (items) => localStorage.setItem(KEY, JSON.stringify(items));

const nextId = (items) =>
  items.length === 0 ? 1 : Math.max(...items.map((i) => i.id || 0)) + 1;

export const getRecurring = () => load();

export const addRecurring = (item) => {
  const items = load();
  const newItem = { ...item, id: nextId(items), active: true };
  save([...items, newItem]);
  return newItem;
};

export const editRecurring = (id, updates) => {
  save(load().map((r) => (r.id === id ? { ...r, ...updates } : r)));
};

export const deleteRecurring = (id) => {
  save(load().filter((r) => r.id !== id));
};

const advanceDate = (dateStr, frequency) => {
  const d = new Date(dateStr + 'T00:00:00');
  if (frequency === 'daily')   d.setDate(d.getDate() + 1);
  if (frequency === 'weekly')  d.setDate(d.getDate() + 7);
  if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  if (frequency === 'yearly')  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

// Call on app start — returns array of {type,tag,amount,notes,date} to create,
// and advances nextDate for each fired recurring item.
export const processDueRecurring = () => {
  const today = new Date().toISOString().slice(0, 10);
  const items = load();
  const toCreate = [];

  const updated = items.map((r) => {
    if (!r.active || r.nextDate > today) return r;
    let cur = { ...r };
    while (cur.nextDate <= today) {
      toCreate.push({
        type:   cur.type,
        tag:    cur.tag,
        amount: cur.amount,
        notes:  cur.notes || '',
        date:   new Date(cur.nextDate + 'T12:00:00').toISOString(),
      });
      cur = { ...cur, nextDate: advanceDate(cur.nextDate, cur.frequency) };
    }
    return cur;
  });

  save(updated);
  return toCreate;
};
