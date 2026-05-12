const KEY = 'bt_goals';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
};

const save = (goals) => { localStorage.setItem(KEY, JSON.stringify(goals)); return goals; };

export const getGoals    = () => load();
export const addGoal     = (g) => save([...load(), { ...g, id: Date.now() }]);
export const updateGoal  = (id, updates) => save(load().map((g) => (g.id === id ? { ...g, ...updates } : g)));
export const deleteGoal  = (id) => save(load().filter((g) => g.id !== id));
