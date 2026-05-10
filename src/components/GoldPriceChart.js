import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { getGoldApiKey } from '../utils/goldPrice';
import { getCachedHistory, setCachedMonth, fetchMonthPrice, getPastMonths } from '../utils/goldHistory';

const RANGES = [
  { label: '3M',  value: 3  },
  { label: '6M',  value: 6  },
  { label: '12M', value: 12 },
];

const fmtK   = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v);
const fmtFull = (v) => `$${new Intl.NumberFormat().format(v)}`;

const GoldPriceChart = () => {
  const [range, setRange]   = useState(6);
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const load = useCallback(async (months) => {
    const apiKey = getGoldApiKey();
    if (!apiKey) {
      setError('Add your goldapi.io API key in Gold Price settings to load chart data.');
      setData([]);
      return;
    }

    const history  = { ...getCachedHistory() };
    const missing  = months.filter((m) => !history[m]);

    setLoading(true);
    setError('');

    // Fetch missing months one at a time to respect rate limits
    for (const month of missing) {
      try {
        const price = await fetchMonthPrice(apiKey, month);
        setCachedMonth(month, price);
        history[month] = price;
      } catch {
        // skip months that fail (weekends / API limit)
      }
    }

    const chartData = months
      .filter((m) => history[m])
      .map((m) => ({
        label: new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        price: history[m],
      }));

    setData(chartData);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(getPastMonths(range));
  }, [range, load]);

  const minPrice = data.length ? Math.min(...data.map((d) => d.price)) : 0;
  const maxPrice = data.length ? Math.max(...data.map((d) => d.price)) : 0;
  const domain   = data.length
    ? [Math.floor(minPrice * 0.995), Math.ceil(maxPrice * 1.005)]
    : ['auto', 'auto'];

  return (
    <div className="px-2 sm:px-4 max-w-6xl mx-auto mt-2">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              🪙 Gold Price (USD / oz)
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
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        {error ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 py-8 text-center">{error}</p>
        ) : loading && data.length === 0 ? (
          <div className="h-40 flex items-center justify-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">Loading price history…</p>
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
                    tickFormatter={fmtK}
                    domain={domain}
                  />
                  <Tooltip
                    formatter={(v) => [fmtFull(v), 'Gold']}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#eab308"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#eab308', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Min / Max summary */}
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

export default GoldPriceChart;
