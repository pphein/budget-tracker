// Heuristic natural-language quick-add parser — not real NLP. Extracts the
// last numeric token as the amount (optionally "k"-suffixed for thousands),
// then fuzzy-matches the remaining words against existing tag names.
const AMOUNT_RE = /(\d[\d,]*(?:\.\d+)?)\s*(k|K)?/g;

export const parseQuickAdd = (text, tags) => {
  if (!text || !text.trim()) return { amount: null, tag: null, type: null };

  const matches = [...text.matchAll(AMOUNT_RE)];
  let amount = null;
  let matchedToken = '';
  if (matches.length > 0) {
    const last = matches[matches.length - 1];
    const num = parseFloat(last[1].replace(/,/g, ''));
    if (!isNaN(num)) {
      amount = last[2] ? num * 1000 : num;
      matchedToken = last[0];
    }
  }

  const remaining = matchedToken ? text.replace(matchedToken, ' ') : text;
  const words = remaining.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  let bestTag = null;
  let bestScore = 0;
  for (const t of (tags || [])) {
    const name = t.name.toLowerCase();
    let score = 0;
    if (words.includes(name)) score = name.length + 10;
    else if (words.some((w) => w.length > 2 && (name.includes(w) || w.includes(name)))) score = name.length;
    if (score > bestScore) { bestScore = score; bestTag = t; }
  }

  return {
    amount,
    tag: bestTag ? bestTag.name : null,
    type: bestTag ? bestTag.type : null,
  };
};
