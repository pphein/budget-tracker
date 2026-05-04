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
