import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import {
  getAlphaVantageKey,
  getCachedOilHistory,
  setCachedOilHistory,
  fetchOilPrices,
} from '../utils/oilPrice';
import { getPastMonths } from '../utils/goldHistory';

const TYPES  = [
  { id: 'WTI',   label: 'WTI',   flag: '🇺🇸' },
  { id: 'BRENT', label: 'Brent', flag: '🌍' },
];
const RANGES = [
  { label: '3M',  value: 3  },
  { label: '6M',  value: 6  },
  { label: '12M', value: 12 },
];

const fmtFull = (v) => `$${new Intl.NumberFormat().format(v)}`;

const OilPriceChart = () => {
  const [type, setType]     = useState('WTI');
  const [range, setRange]   = useState(6);
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const load = useCallback(async (t, months) => {
    const apiKey = getAlphaVantageKey();
    if (!apiKey) {
      setError('Add your Alpha Vantage API key in Settings → Add-ons to load oil prices.');
      setData([]);
      return;
    }

    setLoading(true);
    setError('');

    let history = getCachedOilHistory(t);

    if (!history) {
      try {
        history = await fetchOilPrices(apiKey, t);
        setCachedOilHistory(t, history);
      } catch (e) {
        setError(e.message || 'Failed to load oil price data.');
        setLoading(false);
        return;
      }
    }

    const chartData = months
      .filter((m) => history[m] != null)
      .map((m) => ({
        label: new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        price: history[m],
      }));

    setData(chartData);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(type, getPastMonths(range));
  }, [type, range, load]);

  const minPrice = data.length ? Math.min(...data.map((d) => d.price)) : 0;
  const maxPrice = data.length ? Math.max(...data.map((d) => d.price)) : 0;
  const domain   = data.length
    ? [Math.floor(minPrice * 0.99), Math.ceil(maxPrice * 1.01)]
    : ['auto', 'auto'];

  return (
    <div className="px-2 sm:px-4 max-w-6xl mx-auto mt-2">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              🛢️ Crude Oil (USD / bbl)
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
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* WTI / Brent tabs */}
        <div className="flex gap-2 mb-3">
          {TYPES.map(({ id, label, flag }) => (
            <button
              key={id}
              onClick={() => setType(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                type === id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:bg-gray-200 dark:active:bg-gray-700'
              }`}
            >
              <span>{flag}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Chart body */}
        {error ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 py-8 text-center px-2">{error}</p>
        ) : loading && data.length === 0 ? (
          <div className="h-40 flex items-center justify-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">Loading oil prices…</p>
          </div>
        ) : data.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 py-8 text-center">No data available for this range.</p>
        ) : (
          <>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    width={44}
                    tickFormatter={(v) => v.toFixed(0)}
                    domain={domain}
                  />
                  <Tooltip
                    formatter={(v) => [fmtFull(v), type]}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Min / Max */}
            <div className="flex justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span>Low: <span className="font-medium text-gray-600 dark:text-gray-300">{fmtFull(minPrice)}</span></span>
              <span>High: <span className="font-medium text-gray-600 dark:text-gray-300">{fmtFull(maxPrice)}</span></span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OilPriceChart;
