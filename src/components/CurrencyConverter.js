import React, { useState } from 'react';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

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
        <h3 className="text-sm font-semibold text-[var(--primary-600)] dark:text-[var(--primary-400)] mb-3">
          Currency Converter
        </h3>

        <div className="flex items-center gap-2">
          {/* Amount */}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-24 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none"
            placeholder="1"
            min="0"
          />

          {/* From */}
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="flex-1 px-2 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none"
          >
            {available.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
            ))}
          </select>

          {/* Swap */}
          <button
            onClick={swap}
            className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 active:bg-gray-200 dark:active:bg-gray-700 flex-shrink-0"
          >
            <ArrowsRightLeftIcon className="w-4 h-4" />
          </button>

          {/* To */}
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 px-2 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none"
          >
            {available.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
            ))}
          </select>
        </div>

        {parseFloat(amount) > 0 && (
          <div className="mt-3 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
              {amount} {from} =
            </p>
            <p className="text-xl font-bold text-[var(--primary-700)] dark:text-[var(--primary-300)]">
              {fmt(result, to)} <span className="text-sm font-medium">{to}</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              1 {from} = {fmt(rate1, to)} {to}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
