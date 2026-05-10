const HISTORY_KEY = 'oilPriceHistory';
const CACHE_TTL   = 24 * 60 * 60 * 1000; // 24 hours

// Uses Alpha Vantage's official demo key — no registration required
// WTI: https://www.alphavantage.co/query?function=WTI&interval=monthly&apikey=demo
// BRENT: https://www.alphavantage.co/query?function=BRENT&interval=monthly&apikey=demo
const AV_DEMO_KEY = 'demo';

// Cache: { 'WTI': { cachedAt: ISO, data: { 'YYYY-MM': price } }, 'BRENT': {...} }
export const getCachedOilHistory = (type) => {
  try {
    const s = localStorage.getItem(HISTORY_KEY);
    if (!s) return null;
    const cached = JSON.parse(s)[type];
    if (!cached) return null;
    if (Date.now() - new Date(cached.cachedAt).getTime() > CACHE_TTL) return null;
    return cached.data;
  } catch {
    return null;
  }
};

export const setCachedOilHistory = (type, data) => {
  try {
    const s   = localStorage.getItem(HISTORY_KEY);
    const all = s ? JSON.parse(s) : {};
    all[type] = { cachedAt: new Date().toISOString(), data };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
  } catch {}
};

// type: 'WTI' | 'BRENT' — returns { 'YYYY-MM': price }
export const fetchOilPrices = async (type) => {
  const res = await fetch(
    `https://www.alphavantage.co/query?function=${type}&interval=monthly&apikey=${AV_DEMO_KEY}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  if (json['Error Message']) throw new Error(json['Error Message']);
  if (json['Note'])          throw new Error('Rate limit reached — try again later.');
  if (json['Information'])   throw new Error(json['Information']);

  const monthly = {};
  for (const item of json.data || []) {
    if (item.date && item.value && item.value !== '.') {
      monthly[item.date.slice(0, 7)] = parseFloat(item.value);
    }
  }
  return monthly;
};
