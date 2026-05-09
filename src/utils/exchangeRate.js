const CACHE_KEY = 'exchangeRates';
const TTL_MS    = 60 * 60 * 1000; // 1 hour

export const getCachedRates = () => {
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    if (!saved) return null;
    const data = JSON.parse(saved);
    if (Date.now() - new Date(data.updatedAt).getTime() > TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
};

export const saveRates = (rates) => {
  const data = { rates, updatedAt: new Date().toISOString() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  return data;
};

// Free API — no key required, 1,500 req/month on free plan
// Rates are per 1 USD base
export const fetchExchangeRates = async () => {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.result !== 'success') throw new Error('Failed to fetch rates');
  return data.rates; // { SGD: 1.34, THB: 35.2, MMK: 2100, ... }
};
