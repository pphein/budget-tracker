const CACHE_KEY = 'exchangeRateHistory';

// Cache structure: { 'SGD': { 'YYYY-MM': rate }, 'THB': { ... }, ... }
const getCache = () => {
  try {
    const s = localStorage.getItem(CACHE_KEY);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
};

const setCache = (cache) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

export const getCachedExchangeHistory = (currency) => {
  return getCache()[currency] || {};
};

export const setCachedExchangeMonths = (currency, monthlyRates) => {
  const cache = getCache();
  cache[currency] = { ...(cache[currency] || {}), ...monthlyRates };
  setCache(cache);
};

// Currencies supported by frankfurter.app (free, no key required)
export const CHART_CURRENCIES = [
  { code: 'SGD', flag: '🇸🇬', label: 'SGD' },
  { code: 'THB', flag: '🇹🇭', label: 'THB' },
  { code: 'EUR', flag: '🇪🇺', label: 'EUR' },
  { code: 'GBP', flag: '🇬🇧', label: 'GBP' },
  { code: 'JPY', flag: '🇯🇵', label: 'JPY' },
  { code: 'CNY', flag: '🇨🇳', label: 'CNY' },
  { code: 'AUD', flag: '🇦🇺', label: 'AUD' },
];

// Fetches daily rates for a date range and picks the first available date per month.
// Returns { 'YYYY-MM': rate }
export const fetchExchangeHistory = async (toCurrency, startYearMonth) => {
  const startDate = startYearMonth + '-01';
  const endDate   = new Date().toISOString().slice(0, 10);

  const res = await fetch(
    `https://api.frankfurter.app/${startDate}..${endDate}?from=USD&to=${toCurrency}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  // data.rates: { '2024-01-02': { SGD: 1.34 }, ... }
  const monthly = {};
  for (const [date, rates] of Object.entries(data.rates || {})) {
    const month = date.slice(0, 7);
    if (!monthly[month]) monthly[month] = rates[toCurrency];
  }
  return monthly;
};
