const KEY = 'bt_assets';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
};

const save = (assets) => { localStorage.setItem(KEY, JSON.stringify(assets)); return assets; };

export const getAssets = () => load();

// type: 'bank' | 'gold' | 'other'. Gold entries carry goldUnits (kyat-tha) and
// are valued live via goldPrices.myanmarPrice; bank/other carry a flat value.
export const addAsset = (a) => save([...load(), { ...a, id: Date.now() }]);
export const updateAsset = (id, updates) => save(load().map((a) => (a.id === id ? { ...a, ...updates } : a)));
export const deleteAsset = (id) => save(load().filter((a) => a.id !== id));

export const valueOfAsset = (asset, goldPrices) => {
  if (asset.type === 'gold') {
    const unitPrice = goldPrices?.myanmarPrice || 0;
    return (asset.goldUnits || 0) * unitPrice;
  }
  return asset.value || 0;
};

export const calcNetWorth = ({ accounts = [], transactions = [], assets = [], debts = [], goldPrices = null }) => {
  const accountBalance = accounts
    .filter((a) => !a.archived)
    .reduce((sum, a) => {
      const bal = transactions
        .filter((t) => (t.accountId || 'cash') === a.id)
        .reduce((s, t) => {
          if (t.type === 'income')  return s + parseFloat(t.amount || 0);
          if (t.type === 'expense') return s - parseFloat(t.amount || 0);
          return s;
        }, 0);
      return sum + bal;
    }, 0);

  const assetsValue = assets.reduce((sum, a) => sum + valueOfAsset(a, goldPrices), 0);
  const debtsRemaining = debts.reduce((sum, d) => sum + Math.max(0, d.principal - (d.paidAmount || 0)), 0);

  return {
    accountBalance,
    assetsValue,
    debtsRemaining,
    netWorth: accountBalance + assetsValue - debtsRemaining,
  };
};
