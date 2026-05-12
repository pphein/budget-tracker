const KEY = 'bt_templates';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
};

export const getTemplates = () => load();

export const addTemplate = (tpl) => {
  const updated = [...load(), { ...tpl, id: Date.now() }];
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
};

export const deleteTemplate = (id) => {
  const updated = load().filter((t) => t.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
};
