const KEY = 'bt_budget_limits';

export const getBudgetLimits = () => {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : {};
  } catch { return {}; }
};

export const setBudgetLimit = (tagName, limit) => {
  const limits = getBudgetLimits();
  if (!limit || limit <= 0) {
    delete limits[tagName];
  } else {
    limits[tagName] = limit;
  }
  localStorage.setItem(KEY, JSON.stringify(limits));
  return { ...limits };
};
