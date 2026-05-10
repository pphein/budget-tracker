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

const COLORS = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#ef4444','#06b6d4','#f97316'];

const fmtFull = (v) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(v);

const ExchangeRateChart = () => {
  const [currencies, setCurrencies] = useState(['SGD']);
  const [range, setRange]           = useState(6);
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const toggleCurrency = (code) => {
    setCurrencies((prev) =>
      prev.includes(code)
        ? prev.length > 1 ? prev.filter((c) => c !== code) : prev
        : [...prev, code]
    );
  };

  const load = useCallback(async (curs, months) => {
    setLoading(true);
    setError('');

    const allHistory = {};
    const results = await Promise.allSettled(
      curs.map(async (cur) => {
        const cached  = getCachedExchangeHistory(cur);
        const missing = months.filter((m) => !cached[m]);
        let history   = { ...cached };
        if (missing.length > 0) {
          const fetched = await fetchExchangeHistory(cur, missing);
          setCachedExchangeMonths(cur, fetched);
          history = { ...history, ...fetched };
        }
        allHistory[cur] = history;
      })
    );

    if (results.every((r) => r.status === 'rejected')) {
      setError('Failed to load exchange rate data. Please try again.');
      setLoading(false);
      return;
    }

    const chartData = months
      .filter((m) => curs.some((cur) => allHistory[cur]?.[m]))
      .map((m) => {
        const point = {
          label: new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        };
        curs.forEach((cur) => {
          if (allHistory[cur]?.[m]) point[cur] = allHistory[cur][m];
        });
        return point;
      });

    setData(chartData);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(currencies, getPastMonths(range));
  }, [currencies, range, load]);

  const allValues = data.flatMap((d) => currencies.map((cur) => d[cur]).filter((v) => v != null));
  const minRate   = allValues.length ? Math.min(...allValues) : 0;
  const maxRate   = allValues.length ? Math.max(...allValues) : 0;

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

        {/* Currency tabs — multi-select */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-3 pb-0.5">
          {CHART_CURRENCIES.map(({ code, flag }, idx) => {
            const selected = currencies.includes(code);
            const color    = COLORS[idx % COLORS.length];
            return (
              <button
                key={code}
                onClick={() => toggleCurrency(code)}
                style={selected ? { backgroundColor: color, borderColor: color } : {}}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-colors border ${
                  selected
                    ? 'text-white border-transparent'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent active:bg-gray-200 dark:active:bg-gray-700'
                }`}
              >
                <span>{flag}</span>
                <span>{code}</span>
              </button>
            );
          })}
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
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    formatter={(v, name) => {
                      const info = CHART_CURRENCIES.find((c) => c.code === name);
                      return [`${fmtFull(v)} ${name}`, `${info?.flag || ''} 1 USD`];
                    }}
                    contentStyle={{ fontSize: 12 }}
                  />
                  {currencies.map((cur) => {
                    const idx   = CHART_CURRENCIES.findIndex((c) => c.code === cur);
                    const color = COLORS[idx % COLORS.length];
                    return (
                      <Line
                        key={cur}
                        type="monotone"
                        dataKey={cur}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: color, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Min / Max per currency */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {currencies.map((cur) => {
                const vals    = data.map((d) => d[cur]).filter((v) => v != null);
                const lo      = vals.length ? Math.min(...vals) : null;
                const hi      = vals.length ? Math.max(...vals) : null;
                const info    = CHART_CURRENCIES.find((c) => c.code === cur);
                const idx     = CHART_CURRENCIES.findIndex((c) => c.code === cur);
                const color   = COLORS[idx % COLORS.length];
                if (lo == null) return null;
                return (
                  <div key={cur} className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span>{info?.flag} {cur}:</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">{fmtFull(lo)}</span>
                    <span>–</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">{fmtFull(hi)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExchangeRateChart;
