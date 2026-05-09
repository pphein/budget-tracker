import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { calculateTax, TAX_COUNTRIES } from '../utils/taxCalculator';

const fmt = (n) => new Intl.NumberFormat().format(Math.round(n));

const TaxCard = ({ monthlyIncome, country }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const countryInfo = TAX_COUNTRIES.find((c) => c.code === country);
  if (!countryInfo) return null;

  const annualIncome = monthlyIncome * 12;
  const { tax: annualTax, effectiveRate, breakdown } = calculateTax(annualIncome, country);
  const monthlyTax  = annualTax / 12;
  const afterTax    = monthlyIncome - monthlyTax;

  const monthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{countryInfo.flag}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">Tax Estimate</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{countryInfo.name} · {monthLabel}</p>
          </div>
        </div>
        <button
          onClick={() => setShowBreakdown((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-[var(--primary-500)] px-2 py-1 rounded-lg active:bg-gray-100 dark:active:bg-gray-800"
        >
          {showBreakdown ? 'Hide' : 'Details'}
          {showBreakdown
            ? <ChevronUpIcon   className="w-3.5 h-3.5" />
            : <ChevronDownIcon className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Income</p>
          <p className="text-sm font-bold text-gray-800 dark:text-white">{fmt(monthlyIncome)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Est. Tax</p>
          <p className="text-sm font-bold text-red-500 dark:text-red-400">−{fmt(monthlyTax)}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">After Tax</p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(afterTax)}</p>
        </div>
      </div>

      {/* Effective rate + progress bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
        <span>Effective rate: <span className="font-semibold text-gray-700 dark:text-gray-200">{effectiveRate.toFixed(1)}%</span></span>
        <span>Annual est.: <span className="font-semibold text-gray-700 dark:text-gray-200">{fmt(annualTax)}</span></span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-400 dark:bg-red-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(effectiveRate * 2, 100)}%` }}
        />
      </div>

      {/* Bracket breakdown */}
      {showBreakdown && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Annual Bracket Breakdown
          </p>
          {breakdown.length === 0 ? (
            <p className="text-xs text-gray-400">No tax applicable at this income level.</p>
          ) : (
            <div className="space-y-1.5">
              {breakdown.map(({ min, max, rate, tax }) => (
                <div key={`${min}-${rate}`} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {fmt(min)}–{max ? fmt(max) : '∞'}
                    <span className="ml-1.5 font-medium text-gray-600 dark:text-gray-300">@ {rate}%</span>
                  </span>
                  <span className="font-semibold text-red-500 dark:text-red-400">−{fmt(tax)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-gray-800">
                <span className="font-semibold text-gray-600 dark:text-gray-300">Total annual tax</span>
                <span className="font-bold text-gray-800 dark:text-white">{fmt(annualTax)}</span>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            * Based on annualized monthly income ({countryInfo.currency}). Estimate only — excludes deductions and allowances.
          </p>
        </div>
      )}
    </div>
  );
};

export default TaxCard;
