const CACHE_KEY = 'goldPriceHistory';

// Cache is a flat object: { 'YYYY-MM': price }
export const getCachedHistory = () => {
  try {
    const s = localStorage.getItem(CACHE_KEY);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
};

export const setCachedMonth = (yearMonth, price) => {
  const history = getCachedHistory();
  history[yearMonth] = price;
  localStorage.setItem(CACHE_KEY, JSON.stringify(history));
};

// Fetch gold price (USD/oz) for the 1st day of a given 'YYYY-MM' month
export const fetchMonthPrice = async (apiKey, yearMonth) => {
  const dateStr = yearMonth.replace('-', '') + '01';
  const res = await fetch(`https://www.goldapi.io/api/XAU/USD/${dateStr}`, {
    headers: { 'x-access-token': apiKey, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!data.price) throw new Error('Unexpected API response');
  return Math.round(data.price * 100) / 100;
};

// Returns last N months as 'YYYY-MM' strings, oldest first
export const getPastMonths = (n) => {
  const months = [];
  const now = new Date();
  for (let i = n; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    );
  }
  return months;
};
