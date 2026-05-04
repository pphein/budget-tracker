import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { ChevronUpIcon, ChevronDownIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { getTagColorClasses } from '../utils/tagColors';

const SortIcon = ({ column, sortKey, sortDir }) => {
  if (sortKey !== column) return <ChevronUpIcon className="w-3 h-3 inline ml-1 opacity-30" />;
  return sortDir === 'asc'
    ? <ChevronUpIcon className="w-3 h-3 inline ml-1 text-[var(--primary-500)]" />
    : <ChevronDownIcon className="w-3 h-3 inline ml-1 text-[var(--primary-500)]" />;
};

const fmt = (n) => new Intl.NumberFormat().format(n);

const RecordList = ({ type, records, allTags, handleDeleteTransaction, handleEditTransaction, formatDateTime }) => {
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...records].sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (sortKey === 'date')   { av = new Date(av); bv = new Date(bv); }
    if (sortKey === 'amount') { av = Number(av);   bv = Number(bv);   }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  const totalAmount = sorted.reduce((sum, r) => sum + Number(r.amount), 0);

  const getColor = (tagName) => {
    if (!allTags) return null;
    const found = allTags.find((t) => t.name === tagName);
    return found ? getTagColorClasses(found.colorIndex) : null;
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      sorted.map((r) => ({ Tag: r.tag, Amount: r.amount, Date: r.date }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Records');
    const buf = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(
      new Blob([buf], { type: 'application/octet-stream' }),
      `${type}_records_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
        <BanknotesIcon className="w-16 h-16 mb-4 opacity-40" />
        <p className="text-base font-medium">No {type} records yet.</p>
        <p className="text-sm mt-1">Use the form above to add your first entry.</p>
      </div>
    );
  }

  let running = 0;

  return (
    <div className="w-full overflow-x-auto">
      <table className="table-auto w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 cursor-pointer select-none text-left"
              onClick={() => toggleSort('tag')}
            >
              Tag <SortIcon column="tag" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 cursor-pointer select-none text-right"
              onClick={() => toggleSort('amount')}
            >
              Amount <SortIcon column="amount" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 cursor-pointer select-none text-left"
              onClick={() => toggleSort('date')}
            >
              Date <SortIcon column="date" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right">Running</th>
            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((record, index) => {
            running += Number(record.amount);
            const color = getColor(record.tag);
            return (
              <tr key={record.id ?? index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                  {color ? (
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${color.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.dot}`} />
                      {record.tag}
                    </span>
                  ) : (
                    <span className="text-gray-800 dark:text-gray-200">{record.tag}</span>
                  )}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-gray-800 dark:text-gray-200 font-medium">
                  {fmt(record.amount)}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {formatDateTime(record.date)}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-gray-400 dark:text-gray-500 text-xs">
                  {fmt(running)}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                  <div className="flex gap-1 justify-center">
                    <button
                      className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white px-2 py-1 rounded text-xs"
                      onClick={() => handleEditTransaction(record)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                      onClick={() => handleDeleteTransaction(record)}
                    >
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 dark:bg-gray-700 font-bold text-gray-700 dark:text-gray-200">
            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Total</td>
            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right">{fmt(totalAmount)}</td>
            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2" />
            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2" />
            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
              <button
                onClick={exportToExcel}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
              >
                Export
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default RecordList;
