export const TAX_COUNTRIES = [
  { code: 'MM', name: 'Myanmar',     flag: '🇲🇲', currency: 'MMK' },
  { code: 'SG', name: 'Singapore',   flag: '🇸🇬', currency: 'SGD' },
  { code: 'TH', name: 'Thailand',    flag: '🇹🇭', currency: 'THB' },
  { code: 'US', name: 'USA',         flag: '🇺🇸', currency: 'USD' },
  { code: 'GB', name: 'UK',          flag: '🇬🇧', currency: 'GBP' },
  { code: 'AU', name: 'Australia',   flag: '🇦🇺', currency: 'AUD' },
];

// Annual progressive tax brackets: [min, max (null = ∞), rate %]
const BRACKETS = {
  MM: [
    [0,           4_800_000,  0],
    [4_800_000,   10_000_000, 5],
    [10_000_000,  20_000_000, 10],
    [20_000_000,  30_000_000, 15],
    [30_000_000,  50_000_000, 20],
    [50_000_000,  null,       25],
  ],
  SG: [
    [0,       20_000,  0],
    [20_000,  30_000,  2],
    [30_000,  40_000,  3.5],
    [40_000,  80_000,  7],
    [80_000,  120_000, 11.5],
    [120_000, 160_000, 15],
    [160_000, 200_000, 18],
    [200_000, 240_000, 19],
    [240_000, 280_000, 19.5],
    [280_000, 320_000, 20],
    [320_000, null,    22],
  ],
  TH: [
    [0,           150_000,   0],
    [150_000,     300_000,   5],
    [300_000,     500_000,   10],
    [500_000,     750_000,   15],
    [750_000,     1_000_000, 20],
    [1_000_000,   2_000_000, 25],
    [2_000_000,   5_000_000, 30],
    [5_000_000,   null,      35],
  ],
  US: [
    [0,       11_600,  10],
    [11_600,  47_150,  12],
    [47_150,  100_525, 22],
    [100_525, 191_950, 24],
    [191_950, 243_725, 32],
    [243_725, 609_350, 35],
    [609_350, null,    37],
  ],
  GB: [
    [0,       12_570,  0],
    [12_570,  50_270,  20],
    [50_270,  125_140, 40],
    [125_140, null,    45],
  ],
  AU: [
    [0,       18_200,  0],
    [18_200,  45_000,  19],
    [45_000,  120_000, 32.5],
    [120_000, 180_000, 37],
    [180_000, null,    45],
  ],
};

// Calculates annual tax from annual income using progressive brackets
export const calculateTax = (annualIncome, countryCode) => {
  const brackets = BRACKETS[countryCode];
  if (!brackets || annualIncome <= 0) return { tax: 0, effectiveRate: 0, breakdown: [] };

  let tax = 0;
  const breakdown = [];

  for (const [min, max, rate] of brackets) {
    if (annualIncome <= min) break;
    const taxable = Math.min(annualIncome, max ?? Infinity) - min;
    const bracketTax = taxable * (rate / 100);
    breakdown.push({ min, max, rate, taxable, tax: bracketTax });
    tax += bracketTax;
  }

  return {
    tax,
    effectiveRate: (tax / annualIncome) * 100,
    breakdown: breakdown.filter((b) => b.rate > 0),
  };
};

const KEY = 'taxSettings';

export const getTaxSettings = () => {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : { enabled: false, country: 'MM' };
  } catch {
    return { enabled: false, country: 'MM' };
  }
};

export const saveTaxSettings = (settings) => {
  localStorage.setItem(KEY, JSON.stringify(settings));
  return settings;
};
