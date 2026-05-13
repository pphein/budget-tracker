import React, { useMemo } from 'react';

const TagExpenseHeatmap = ({ transactions, filterYears }) => {
  const { tags, months, matrix, maxVal } = useMemo(() => {
    const now = new Date();
    let monthKeys = [];

    if (filterYears.length === 1) {
      const y    = filterYears[0];
      const maxM = y === now.getFullYear() ? now.getMonth() + 1 : 12;
      for (let m = 1; m <= maxM; m++)
        monthKeys.push(`${y}-${String(m).padStart(2, '0')}`);
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    }

    const matrix   = {};
    const tagTotals = {};

    transactions.forEach((t) => {
      if (t.type !== 'expense') return;
      const key = t.date.slice(0, 7);
      if (!monthKeys.includes(key)) return;
      if (!matrix[t.tag]) matrix[t.tag] = {};
      matrix[t.tag][key] = (matrix[t.tag][key] || 0) + parseFloat(t.amount || 0);
      tagTotals[t.tag]   = (tagTotals[t.tag] || 0) + parseFloat(t.amount || 0);
    });

    const tags = Object.entries(tagTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);

    let maxVal = 0;
    tags.forEach((tag) =>
      monthKeys.forEach((mk) => {
        maxVal = Math.max(maxVal, matrix[tag]?.[mk] || 0);
      })
    );

    return { tags, months: monthKeys, matrix, maxVal };
  }, [transactions, filterYears]);

  if (tags.length === 0) return null;

  const fmtLabel = (key) => {
    const [y, m] = key.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'short' });
  };

  const cellAlpha = (val) => (maxVal > 0 && val > 0 ? Math.max(0.12, val / maxVal) : 0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
        Expense Heatmap by Tag
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left pb-2 pr-2 text-gray-400 dark:text-gray-500 font-medium w-24">Tag</th>
              {months.map((mk) => (
                <th key={mk} className="text-center pb-2 text-gray-400 dark:text-gray-500 font-medium min-w-[36px]">
                  {fmtLabel(mk)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag}>
                <td className="py-1 pr-2 text-gray-600 dark:text-gray-400 font-medium truncate max-w-[96px]">{tag}</td>
                {months.map((mk) => {
                  const val   = matrix[tag]?.[mk] || 0;
                  const alpha = cellAlpha(val);
                  return (
                    <td key={mk} className="py-1 text-center">
                      <div
                        className="mx-auto w-8 h-7 rounded flex items-center justify-center font-medium"
                        style={{ backgroundColor: alpha > 0 ? `rgba(239,68,68,${alpha * 0.85})` : 'transparent' }}
                        title={val > 0 ? `${tag} / ${fmtLabel(mk)}: ${Math.round(val).toLocaleString()}` : ''}
                      >
                        {val > 0 ? (
                          <span className={alpha > 0.45 ? 'text-white' : 'text-red-700 dark:text-red-300'}>
                            {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : Math.round(val)}
                          </span>
                        ) : (
                          <span className="text-gray-200 dark:text-gray-700">·</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-gray-400 dark:text-gray-500">Low</span>
        <div className="flex gap-0.5">
          {[0.12, 0.3, 0.5, 0.7, 0.85].map((a) => (
            <div key={a} className="w-5 h-3 rounded-sm" style={{ backgroundColor: `rgba(239,68,68,${a})` }} />
          ))}
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">High</span>
      </div>
    </div>
  );
};

export default TagExpenseHeatmap;
