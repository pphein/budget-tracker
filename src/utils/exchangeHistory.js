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

const setCache = (cache) => localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

export const getCachedExchangeHistory = (currency) => getCache()[currency] || {};

export const setCachedExchangeMonths = (currency, monthlyRates) => {
  const cache = getCache();
  cache[currency] = { ...(cache[currency] || {}), ...monthlyRates };
  setCache(cache);
};

// Uses @fawazahmed0/currency-api via jsDelivr CDN — free, no API key, supports 150+ currencies
// Docs: https://github.com/fawazahmed0/exchange-api
export const CHART_CURRENCIES = [
  { code: 'SGD', flag: '🇸🇬' },
  { code: 'THB', flag: '🇹🇭' },
  { code: 'MMK', flag: '🇲🇲' },
  { code: 'EUR', flag: '🇪🇺' },
  { code: 'GBP', flag: '🇬🇧' },
  { code: 'JPY', flag: '🇯🇵' },
  { code: 'CNY', flag: '🇨🇳' },
  { code: 'AUD', flag: '🇦🇺' },
];

// Fetches rates for an array of 'YYYY-MM' months in parallel.
// Returns { 'YYYY-MM': rate }
export const fetchExchangeHistory = async (toCurrency, months) => {
  const key = toCurrency.toLowerCase();

  const results = await Promise.all(
    months.map(async (yearMonth) => {
      try {
        const date = yearMonth + '-01';
        const res  = await fetch(
          `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/usd.json`
        );
        if (!res.ok) return null;
        const data = await res.json();
        const rate = data?.usd?.[key];
        return rate != null ? { month: yearMonth, rate } : null;
      } catch {
        return null;
      }
    })
  );

  const monthly = {};
  for (const r of results) {
    if (r) monthly[r.month] = r.rate;
  }
  return monthly;
};
