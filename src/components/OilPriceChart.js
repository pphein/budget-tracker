import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import {
  getCachedOilHistory,
  setCachedOilHistory,
  fetchOilPrices,
} from '../utils/oilPrice';
import { getPastMonths } from '../utils/goldHistory';

const BBL_TO_LITER = 158.987;

const TYPES = [
  { id: 'OCTANE92', apiFunc: 'WTI',          label: 'Octane 92',   icon: '⛽', unit: 'USD/L',    divisor: BBL_TO_LITER },
  { id: 'OCTANE95', apiFunc: 'BRENT',         label: 'Octane 95',   icon: '⛽', unit: 'USD/L',    divisor: BBL_TO_LITER },
  { id: 'DIESEL',   apiFunc: 'WTI',           label: 'Diesel',      icon: '🚛', unit: 'USD/L',    divisor: BBL_TO_LITER },
  { id: 'NATGAS',   apiFunc: 'NATURAL_GAS',   label: 'Natural Gas', icon: '🔥', unit: 'USD/MMBtu', divisor: 1           },
];
const RANGES = [
  { label: '3M',  value: 3  },
  { label: '6M',  value: 6  },
  { label: '12M', value: 12 },
];

const fmtFull = (v, decimals = 4) =>
  `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v)}`;

const COLORS = ['#f97316', '#ef4444', '#8b5cf6', '#10b981'];

const OilPriceChart = () => {
  const [typeIds, setTypeIds] = useState(['OCTANE92']);
  const [range, setRange]     = useState(6);
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const toggleType = (id) => {
    setTypeIds((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((t) => t !== id) : prev
        : [...prev, id]
    );
  };

  const load = useCallback(async (types, months) => {
    setLoading(true);
    setError('');

    const uniqueFuncs = [...new Set(types.map((t) => t.apiFunc))];
    const allHistory  = {};

    try {
      await Promise.all(
        uniqueFuncs.map(async (apiFunc) => {
          let history = getCachedOilHistory(apiFunc);
          if (!history) {
            history = await fetchOilPrices(apiFunc);
            setCachedOilHistory(apiFunc, history);
          }
          allHistory[apiFunc] = history;
        })
      );
    } catch (e) {
      setError(e.message || 'Failed to load oil price data.');
      setLoading(false);
      return;
    }

    const chartData = months
      .filter((m) => types.some((t) => allHistory[t.apiFunc]?.[m] != null))
      .map((m) => {
        const point = {
          label: new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        };
        types.forEach((t) => {
          if (allHistory[t.apiFunc]?.[m] != null) {
            point[t.id] = parseFloat((allHistory[t.apiFunc][m] / t.divisor).toFixed(4));
          }
        });
        return point;
      });

    setData(chartData);
    setLoading(false);
  }, []);

  const activeTypes = TYPES.filter((t) => typeIds.includes(t.id));

  useEffect(() => {
    load(activeTypes, getPastMonths(range));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeIds, range, load]);

  const headerLabel = activeTypes.length === 1
    ? `🛢️ ${activeTypes[0].label} (${activeTypes[0].unit})`
    : '🛢️ Fuel Prices';

  return (
    <div className="px-2 sm:px-4 max-w-6xl mx-auto mt-2">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              {headerLabel}
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

        {/* Fuel type tabs — multi-select */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-3 pb-0.5">
          {TYPES.map(({ id, label, icon }, idx) => {
            const selected = typeIds.includes(id);
            const color    = COLORS[idx % COLORS.length];
            return (
              <button
                key={id}
                onClick={() => toggleType(id)}
                style={selected ? { backgroundColor: color, borderColor: color } : {}}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-colors border ${
                  selected
                    ? 'text-white border-transparent'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent active:bg-gray-200 dark:active:bg-gray-700'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
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
                    width={52}
                    tickFormatter={(v) => v.toFixed(3)}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    formatter={(v, name) => {
                      const t = TYPES.find((x) => x.id === name);
                      return [fmtFull(v, t?.divisor === 1 ? 2 : 4), `${t?.icon || ''} ${t?.label || name}`];
                    }}
                    contentStyle={{ fontSize: 12 }}
                  />
                  {activeTypes.map((t, idx) => {
                    const color = COLORS[TYPES.findIndex((x) => x.id === t.id) % COLORS.length];
                    return (
                      <Line
                        key={t.id}
                        type="monotone"
                        dataKey={t.id}
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

            {/* Min / Max per type */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {activeTypes.map((t) => {
                const vals  = data.map((d) => d[t.id]).filter((v) => v != null);
                const lo    = vals.length ? Math.min(...vals) : null;
                const hi    = vals.length ? Math.max(...vals) : null;
                const color = COLORS[TYPES.findIndex((x) => x.id === t.id) % COLORS.length];
                const dec   = t.divisor === 1 ? 2 : 4;
                if (lo == null) return null;
                return (
                  <div key={t.id} className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span>{t.icon} {t.label}:</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">{fmtFull(lo, dec)}</span>
                    <span>–</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">{fmtFull(hi, dec)}</span>
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

export default OilPriceChart;
