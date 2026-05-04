export const getGoldPrices = () => {
  try {
    const saved = localStorage.getItem('goldPrices');
    return saved
      ? JSON.parse(saved)
      : { worldPrice: null, myanmarPrice: null, updatedAt: null };
  } catch {
    return { worldPrice: null, myanmarPrice: null, updatedAt: null };
  }
};

export const saveGoldPrices = (prices) => {
  const data = { ...prices, updatedAt: new Date().toISOString() };
  localStorage.setItem('goldPrices', JSON.stringify(data));
  return data;
};

export const getGoldApiKey = () => localStorage.getItem('goldApiKey') || '';
export const saveGoldApiKey = (key) => localStorage.setItem('goldApiKey', key);

// Fetches live world gold price (USD per troy oz) from goldapi.io
// Free tier: 100 requests/month — sign up at https://www.goldapi.io
export const fetchWorldGoldPrice = async (apiKey) => {
  const res = await fetch('https://www.goldapi.io/api/XAU/USD', {
    headers: {
      'x-access-token': apiKey,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  const data = await res.json();
  if (!data.price) throw new Error('Unexpected response from API');
  return Math.round(data.price * 100) / 100; // USD per troy oz, 2 decimals
};
