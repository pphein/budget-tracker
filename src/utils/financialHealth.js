// Shared math behind SavingsRateCard / IncomeStabilityCard / BudgetProgress,
// extracted so HealthScoreCard can compose the same figures without
// duplicating the formulas.

export const calcSavingsRate = (transactions, filterYears, filterMonths) => {
  const filter = (years, months) =>
    transactions.filter((t) => {
      const d = new Date(t.date);
      if (years.length && !years.includes(d.getFullYear())) return false;
      if (months.length && !months.includes(d.getMonth() + 1)) return false;
      return true;
    });

  const sum = (txns, type) =>
    txns.filter((t) => t.type === type).reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  const curr = filter(filterYears, filterMonths);
  const income  = sum(curr, 'income');
  const expense = sum(curr, 'expense');
  const rate    = income > 0 ? ((income - expense) / income) * 100 : null;

  // Previous period
  let prevYears = filterYears, prevMonths = filterMonths;
  if (filterMonths.length === 1 && filterYears.length === 1) {
    let m = filterMonths[0] - 1, y = filterYears[0];
    if (m === 0) { m = 12; y -= 1; }
    prevMonths = [m]; prevYears = [y];
  } else if (filterYears.length === 1 && filterMonths.length === 0) {
    prevYears = [filterYears[0] - 1]; prevMonths = [];
  }
  const prev     = filter(prevYears, prevMonths);
  const pIncome  = sum(prev, 'income');
  const pExpense = sum(prev, 'expense');
  const prevRate = pIncome > 0 ? ((pIncome - pExpense) / pIncome) * 100 : null;
  const diff     = rate !== null && prevRate !== null ? rate - prevRate : null;

  return { rate, diff, income, expense };
};

export const calcIncomeStability = (transactions) => {
  const now    = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year:  d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
    });
  }

  const monthly = months.map(({ year, month, label }) => {
    const income = transactions
      .filter((t) => {
        if (t.type !== 'income') return false;
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      })
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    return { year, month, label, income };
  });

  const withData = monthly.filter((m) => m.income > 0);
  if (withData.length < 3) return null;

  const avg  = withData.reduce((s, m) => s + m.income, 0) / withData.length;
  const max  = Math.max(...monthly.map((m) => m.income));
  const flags = monthly.filter((m) => m.income > 0 && m.income < avg * 0.8);

  const last = monthly[monthly.length - 1];
  const prev = monthly[monthly.length - 2];
  const trend = prev.income > 0 ? ((last.income - prev.income) / prev.income) * 100 : null;

  return { monthly, avg, max, flags, trend, last };
};

export const calcBudgetAdherence = (expenseByTag, limits) => {
  const entries = Object.entries(limits || {}).filter(([, lim]) => lim > 0);
  if (entries.length === 0) return null;

  const scores = entries.map(([tag, limit]) => {
    const spent = expenseByTag[tag] || 0;
    const pct = (spent / limit) * 100;
    return pct <= 100 ? 100 : Math.max(0, 200 - pct);
  });
  const overCount = entries.filter(([tag, limit]) => (expenseByTag[tag] || 0) > limit).length;

  return {
    score: scores.reduce((s, v) => s + v, 0) / scores.length,
    overCount,
    totalCount: entries.length,
  };
};

const savingsScoreFromRate = (rate) => {
  if (rate === null) return null;
  if (rate >= 20) return 100;
  if (rate >= 0) return 50 + (rate / 20) * 50;
  return Math.max(0, 50 + rate);
};

const stabilityScoreFromFlags = (flagCount) => Math.max(0, 100 - flagCount * 20);

export const calcHealthScore = ({ savingsRate, incomeStability, budgetAdherence }) => {
  const parts = [];
  if (savingsRate?.rate != null) parts.push(savingsScoreFromRate(savingsRate.rate));
  if (incomeStability) parts.push(stabilityScoreFromFlags(incomeStability.flags.length));
  if (budgetAdherence) parts.push(budgetAdherence.score);

  if (parts.length === 0) return null;

  const score = Math.round(parts.reduce((s, v) => s + v, 0) / parts.length);
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  return { score, grade };
};
