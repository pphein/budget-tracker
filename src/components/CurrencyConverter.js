import React, { useState } from 'react';
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline';

const CURRENCIES = [
  { code: 'USD', flag: '🇺🇸' },
  { code: 'SGD', flag: '🇸🇬' },
  { code: 'THB', flag: '🇹🇭' },
  { code: 'MMK', flag: '🇲🇲' },
  { code: 'EUR', flag: '🇪🇺' },
  { code: 'GBP', flag: '🇬🇧' },
  { code: 'JPY', flag: '🇯🇵' },
  { code: 'CNY', flag: '🇨🇳' },
  { code: 'KRW', flag: '🇰🇷' },
  { code: 'AUD', flag: '🇦🇺' },
];

const fmt = (n, code) => {
  const decimals = ['JPY', 'KRW', 'MMK'].includes(code) ? 0 : 4;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(n);
};


const CurrencyConverter = ({ rates }) => {
  const [amount, setAmount] = useState('1');
  const [from,   setFrom]   = useState('USD');
  const [to,     setTo]     = useState('SGD');

  if (!rates) return null;

  const allRates  = { ...rates, USD: 1 };
  const available = CURRENCIES.filter((c) => allRates[c.code]);

  const fromRate = allRates[from] || 1;
  const toRate   = allRates[to]   || 1;
  const result   = parseFloat(amount || 0) * (toRate / fromRate);
  const rate1    = toRate / fromRate;

  const swap = () => { setFrom(to); setTo(from); };

  return (
    <div className="px-2 sm:px-4 max-w-6xl mx-auto mt-2">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-[var(--primary-600)] dark:text-[var(--primary-400)] mb-4">
          Currency Converter
        </h3>

        {/* From card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">From</span>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none max-w-[140px]"
            >
              {available.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full bg-transparent text-2xl font-bold text-gray-800 dark:text-gray-100 focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
          />
        </div>

        {/* Swap button */}
        <div className="flex justify-center my-2">
          <button
            onClick={swap}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--primary-500)] text-white text-xs font-medium active:bg-[var(--primary-600)] transition-colors shadow-sm"
          >
            <ArrowsUpDownIcon className="w-3.5 h-3.5" />
            Swap
          </button>
        </div>

        {/* To card */}
        <div className="rounded-xl border border-[var(--primary-200)] dark:border-[var(--primary-800)] bg-[var(--primary-50)] dark:bg-[var(--primary-900)]/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--primary-500)] dark:text-[var(--primary-400)]">To</span>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none max-w-[140px]"
            >
              {available.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
          </div>
          <p className="text-2xl font-bold text-[var(--primary-700)] dark:text-[var(--primary-300)]">
            {parseFloat(amount) > 0 ? fmt(result, to) : '—'}
          </p>
        </div>

        {/* Rate hint */}
        {parseFloat(amount) > 0 && (
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
            1 {from} = {fmt(rate1, to)} {to}
          </p>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
