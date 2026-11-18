import { getTags, addTag } from '../db';
import { getAccounts, addAccount } from './accounts';
import { getBudgetLimits, setBudgetLimit } from './budgetLimits';

export const QR_MAX_BYTES = 2000;

// Small, unencrypted-by-design config share (tags/accounts/budget limits) —
// distinct from the encrypted full backup, which won't fit in a scannable QR.
export const buildQrPayload = async () => {
  const [tags, accounts] = await Promise.all([getTags(), Promise.resolve(getAccounts())]);
  const payload = {
    v: 1,
    tags: tags.map((t) => ({ name: t.name, type: t.type, colorIndex: t.colorIndex })),
    accounts: accounts.filter((a) => !a.archived).map((a) => ({ name: a.name, colorIndex: a.colorIndex })),
    budgetLimits: getBudgetLimits(),
  };
  const json = JSON.stringify(payload);
  return { json, tooLarge: new Blob([json]).size > QR_MAX_BYTES };
};

export const applyQrPayload = async (json) => {
  const data = JSON.parse(json);
  if (data.v !== 1) throw new Error('Unsupported payload version');

  const existingTags = await getTags();
  const existingNames = new Set(existingTags.map((t) => t.name.toLowerCase()));
  for (const t of data.tags || []) {
    if (!existingNames.has(t.name.toLowerCase())) {
      await addTag({ name: t.name, type: t.type, colorIndex: t.colorIndex ?? 0 });
    }
  }

  const existingAccounts = getAccounts();
  const existingAccountNames = new Set(existingAccounts.map((a) => a.name.toLowerCase()));
  for (const a of data.accounts || []) {
    if (!existingAccountNames.has(a.name.toLowerCase())) {
      addAccount({ name: a.name, colorIndex: a.colorIndex ?? 0 });
    }
  }

  Object.entries(data.budgetLimits || {}).forEach(([tag, limit]) => setBudgetLimit(tag, limit));

  return data;
};
