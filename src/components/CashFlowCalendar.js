import React, { useMemo } from 'react';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const CashFlowCalendar = ({ transactions, filterYears, filterMonths }) => {
  const cal = useMemo(() => {
    if (filterYears.length !== 1 || filterMonths.length !== 1) return null;
    const year  = filterYears[0];
    const month = filterMonths[0];

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDow    = new Date(year, month - 1, 1).getDay();

    const dayMap = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getFullYear() !== year || d.getMonth() + 1 !== month) return;
      const day = d.getDate();
      if (!dayMap[day]) dayMap[day] = { income: 0, expense: 0 };
      if (t.type === 'income')  dayMap[day].income  += parseFloat(t.amount || 0);
      if (t.type === 'expense') dayMap[day].expense += parseFloat(t.amount || 0);
    });

    return { year, month, daysInMonth, firstDow, dayMap };
  }, [transactions, filterYears, filterMonths]);

  if (!cal) return null;

  const { year, month, daysInMonth, firstDow, dayMap } = cal;
  const now     = new Date();
  const isToday = (d) =>
    now.getFullYear() === year && now.getMonth() + 1 === month && now.getDate() === d;

  const getDayStyle = (day) => {
    const data = dayMap[day];
    if (!data) return 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500';
    const net = data.income - data.expense;
    if (net > 0)  return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300';
    if (net < 0)  return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  };

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const intlFmt = new Intl.NumberFormat();
  const tip = (day) => {
    const data = dayMap[day];
    if (!data) return '';
    return `Income: ${intlFmt.format(Math.round(data.income))}, Expense: ${intlFmt.format(Math.round(data.expense))}`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
        Cash Flow — {MONTH_NAMES[month - 1]} {year}
      </p>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 dark:text-gray-500 font-medium py-0.5">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const today = isToday(day);
          return (
            <div
              key={day}
              title={tip(day)}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${getDayStyle(day)} ${today ? 'ring-2 ring-[var(--primary-500)]' : ''}`}
            >
              <span className={today ? 'font-bold' : ''}>{day}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-center">
        {[
          { color: 'bg-green-100 dark:bg-green-900/40', label: 'Net positive' },
          { color: 'bg-red-100 dark:bg-red-900/40',   label: 'Net negative' },
          { color: 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700', label: 'No activity' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CashFlowCalendar;
