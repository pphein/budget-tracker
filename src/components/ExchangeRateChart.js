import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import {
  CHART_CURRENCIES,
  getCachedExchangeHistory,
  setCachedExchangeMonths,
  fetchExchangeHistory,
} from '../utils/exchangeHistory';
import { getPastMonths } from '../utils/goldHistory';

const RANGES = [
  { label: '3M',  value: 3  },
  { label: '6M',  value: 6  },
  { label: '12M', value: 12 },
];

const fmtFull = (v) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(v);

const ExchangeRateChart = () => {
  const [currency, setCurrency] = useState('SGD');
  const [range, setRange]       = useState(6);
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const load = useCallback(async (cur, months) => {
    setLoading(true);
    setError('');

    const cached  = getCachedExchangeHistory(cur);
    const missing = months.filter((m) => !cached[m]);

    let history = { ...cached };

    if (missing.length > 0) {
      try {
        // Fetch all missing months in one request using the earliest missing month as start
        const earliest = missing[0];
        const fetched  = await fetchExchangeHistory(cur, earliest);
        setCachedExchangeMonths(cur, fetched);
        history = { ...history, ...fetched };
      } catch (e) {
        setError('Failed to load exchange rate data. Please try again.');
        setLoading(false);
        return;
      }
    }

    const chartData = months
      .filter((m) => history[m])
      .map((m) => ({
        label: new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        rate:  history[m],
      }));

    setData(chartData);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(currency, getPastMonths(range));
  }, [currency, range, load]);

  const minRate = data.length ? Math.min(...data.map((d) => d.rate)) : 0;
  const maxRate = data.length ? Math.max(...data.map((d) => d.rate)) : 0;
  const domain  = data.length
    ? [parseFloat((minRate * 0.995).toFixed(4)), parseFloat((maxRate * 1.005).toFixed(4))]
    : ['auto', 'auto'];

  const currencyInfo = CHART_CURRENCIES.find((c) => c.code === currency);

  return (
    <div className="px-2 sm:px-4 max-w-6xl mx-auto mt-2">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              💵 1 USD =
            </span>
            {loading && (
              <ArrowPathIcon className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />
            )}
          </div>

          {/* Range selector */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {RANGES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setRange(value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  range === value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Currency tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-3 pb-0.5">
          {CHART_CURRENCIES.map(({ code, flag }) => (
            <button
              key={code}
              onClick={() => setCurrency(code)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-colors ${
                currency === code
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:bg-gray-200 dark:active:bg-gray-700'
              }`}
            >
              <span>{flag}</span>
              <span>{code}</span>
            </button>
          ))}
        </div>

        {/* Chart body */}
        {error ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 py-8 text-center">{error}</p>
        ) : loading && data.length === 0 ? (
          <div className="h-40 flex items-center justify-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">Loading rate history…</p>
          </div>
        ) : data.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 py-8 text-center">No data available.</p>
        ) : (
          <>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    width={52}
                    tickFormatter={(v) => v.toFixed(2)}
                    domain={domain}
                  />
                  <Tooltip
                    formatter={(v) => [`${fmtFull(v)} ${currency}`, '1 USD']}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Min / Max */}
            <div className="flex justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span>
                Low: <span className="font-medium text-gray-600 dark:text-gray-300">{fmtFull(minRate)} {currencyInfo?.flag}</span>
              </span>
              <span>
                High: <span className="font-medium text-gray-600 dark:text-gray-300">{fmtFull(maxRate)} {currencyInfo?.flag}</span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExchangeRateChart;
