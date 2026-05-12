import React, { useState } from 'react';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  return lines.map((line) => {
    const cols = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  });
};

const CSVImportModal = ({ isOpen, onClose, allTags, onImport }) => {
  const [rows, setRows]         = useState(null);
  const [headers, setHeaders]   = useState([]);
  const [colTag, setColTag]     = useState('');
  const [colAmt, setColAmt]     = useState('');
  const [colDate, setColDate]   = useState('');
  const [colNotes, setColNotes] = useState('');
  const [colType, setColType]   = useState('');
  const [defType, setDefType]   = useState('expense');
  const [defTag, setDefTag]     = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult]     = useState(null);

  if (!isOpen) return null;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      if (parsed.length < 2) return;
      setHeaders(parsed[0]);
      setRows(parsed.slice(1).filter((r) => r.some((c) => c)));
      setResult(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!rows || !colAmt) return;
    setImporting(true);
    const tagNames = new Set(allTags.map((t) => t.name.toLowerCase()));
    const toImport = [];

    for (const row of rows) {
      const amtRaw = colAmt ? row[headers.indexOf(colAmt)]?.replace(/[^0-9.-]/g, '') : '';
      const amount = parseFloat(amtRaw);
      if (isNaN(amount) || amount <= 0) continue;

      const tagRaw = colTag ? row[headers.indexOf(colTag)] : defTag;
      const tag = tagNames.has((tagRaw || '').toLowerCase())
        ? allTags.find((t) => t.name.toLowerCase() === (tagRaw || '').toLowerCase())?.name
        : defTag || allTags[0]?.name;
      if (!tag) continue;

      const dateRaw = colDate ? row[headers.indexOf(colDate)] : null;
      let date = new Date().toISOString();
      if (dateRaw) {
        const parsed = new Date(dateRaw);
        if (!isNaN(parsed)) date = parsed.toISOString();
      }

      const notes = colNotes ? row[headers.indexOf(colNotes)] || '' : '';
      const typeRaw = colType ? row[headers.indexOf(colType)] : defType;
      const type = ['income', 'expense'].includes((typeRaw || '').toLowerCase()) ? typeRaw.toLowerCase() : defType;

      toImport.push({ type, tag, amount, date, notes });
    }

    await onImport(toImport);
    setResult({ count: toImport.length });
    setImporting(false);
  };

  const preview = rows?.slice(0, 4) || [];

  const ColSelect = ({ label, value, onChange }) => (
    <div>
      <label className="text-xs text-gray-400 dark:text-gray-500">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full mt-0.5 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none">
        <option value="">— skip —</option>
        {headers.map((h, i) => <option key={i} value={h}>{h}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Import CSV</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* File picker */}
          <label className="flex flex-col items-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-[var(--primary-400)]">
            <ArrowUpTrayIcon className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Tap to select a CSV file</span>
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </label>

          {rows && (
            <>
              <p className="text-xs text-gray-400 dark:text-gray-500">{rows.length} data rows detected</p>

              {/* Column mapping */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Map Columns</p>
                <div className="grid grid-cols-2 gap-2">
                  <ColSelect label="Amount *" value={colAmt}   onChange={setColAmt}   />
                  <ColSelect label="Date"      value={colDate}  onChange={setColDate}  />
                  <ColSelect label="Tag"       value={colTag}   onChange={setColTag}   />
                  <ColSelect label="Notes"     value={colNotes} onChange={setColNotes} />
                  <ColSelect label="Type (income/expense)" value={colType} onChange={setColType} />
                </div>
              </div>

              {/* Defaults */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Defaults (if column not mapped)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Default type</label>
                    <select value={defType} onChange={(e) => setDefType(e.target.value)}
                      className="w-full mt-0.5 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none">
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Default tag</label>
                    <select value={defTag} onChange={(e) => setDefTag(e.target.value)}
                      className="w-full mt-0.5 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none">
                      <option value="">Select…</option>
                      {allTags.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div className="overflow-x-auto">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Preview (first {preview.length} rows)</p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        {headers.map((h, i) => <th key={i} className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-left whitespace-nowrap">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => <td key={ci} className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-gray-600 dark:text-gray-400 whitespace-nowrap max-w-[80px] truncate">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {result && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium text-center">
                  ✓ Imported {result.count} transaction{result.count !== 1 ? 's' : ''}
                </p>
              )}

              <button
                onClick={handleImport}
                disabled={!colAmt || importing}
                className="w-full py-3 rounded-xl bg-[var(--primary-500)] active:bg-[var(--primary-600)] text-white text-sm font-semibold disabled:opacity-40"
              >
                {importing ? 'Importing…' : `Import ${rows.length} rows`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
