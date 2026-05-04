import React, { useState, useEffect, useRef, forwardRef, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/react/20/solid';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import RecordList from './components/RecordList';
import Filter from './components/Filter';
import BottomNav from './components/BottomNav';
import SummaryCards from './components/SummaryCards';
import InfoModal from './components/InfoModal';
import Toast from './components/Toast';
import EditTransactionModal from './components/EditTransactionModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import TagsManagementModal from './components/TagsManagementModal';
import BalanceChart from './components/BalanceChart';
import SkeletonRows from './components/SkeletonRows';
import MonthMultiPicker from './components/MonthMultiPicker';
import YearMultiPicker from './components/YearMultiPicker';
import { getTagColorClasses } from './utils/tagColors';

import {
  addTransaction, getTransactions, deleteTransaction, editTransaction,
  getTags, addTag, deleteTag, editTag,
} from './db';

// ─── Dark mode: follow system preference ──────────────────────────────────────
const applyDark = (e) => document.documentElement.classList.toggle('dark', e.matches);

// ─── Custom datepicker inputs — defined outside App to keep stable references ─
const DateBtn = forwardRef(({ value, onClick, className }, ref) => (
  <button className={className} onClick={onClick} ref={ref}>{value}</button>
));


const App = () => {
  const [activeTab, setActiveTab]       = useState('income');
  const [transactions, setTransactions] = useState([]);
  const [allTags, setAllTags]           = useState([]);   // every tag regardless of type
  const [tags, setTags]                 = useState([]);   // tags for active type
  const [tag, setTag]                   = useState('');
  const [amount, setAmount]             = useState('');
  const [date, setDate]                 = useState(new Date());
  const [selectedTag, setSelectedTag]   = useState('');
  const [balanceView, setBalanceView]           = useState('monthly'); // 'daily' | 'monthly' | 'yearly'
  // daily → Date[], monthly → "YYYY-MM"[], yearly → "YYYY"[]
  const [balanceSelection, setBalanceSelection] = useState([]);
  const [loading, setLoading]           = useState(true);

  // Modals
  const [editingTx, setEditingTx]               = useState(null);
  const [isEditOpen, setIsEditOpen]             = useState(false);
  const [deletingTx, setDeletingTx]             = useState(null);
  const [isDeleteOpen, setIsDeleteOpen]         = useState(false);
  const [isTagsOpen, setIsTagsOpen]             = useState(false);
  const [infoMessage, setInfoMessage]           = useState('');
  const [isInfoOpen, setIsInfoOpen]             = useState(false);
  const [toast, setToast]                       = useState(null);

  const tabs         = ['income', 'expense', 'balance'];
  const touchStartX  = useRef(null);
  const touchStartY  = useRef(null);
  const isScrolling  = useRef(false);

  // Dark mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    applyDark(mq);
    mq.addEventListener('change', applyDark);
    return () => mq.removeEventListener('change', applyDark);
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => setToast({ message, type });
  const showInfo  = (message) => { setInfoMessage(message); setIsInfoOpen(true); };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'numeric', day: '2-digit',
    });
  };

  // Convert a local Date → "YYYY-MM-DD" without UTC shift
  const toLocalDateStr = (d) => {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };


  // ─── Data loading ─────────────────────────────────────────────────────────
  const loadAll = async () => {
    setLoading(true);
    const [txData, tagData] = await Promise.all([getTransactions(), getTags()]);
    setTransactions(txData);
    setAllTags(tagData);
    const typeTags = tagData.filter((t) => t.type === activeTab);
    setTags(typeTags);
    setTag((prev) => {
      if (typeTags.length === 0) return '';
      if (typeTags.some((t) => t.name === prev)) return prev;
      return typeTags[0].name;
    });
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Touch swipe ──────────────────────────────────────────────────────────
  const handleTouchStart = (e) => {
    if (e.target.closest('.overflow-x-auto')) { isScrolling.current = true; return; }
    isScrolling.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (isScrolling.current) { isScrolling.current = false; return; }
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx)) { touchStartX.current = null; return; }
    if (Math.abs(dx) > 50) {
      const i = tabs.indexOf(activeTab);
      if (dx < 0 && i < tabs.length - 1) handleTabChange(tabs[i + 1]);
      else if (dx > 0 && i > 0)          handleTabChange(tabs[i - 1]);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleTabChange = (t) => {
    setActiveTab(t);
    setSelectedTag('');
  };

  // ─── Transactions ─────────────────────────────────────────────────────────
  const handleAddTransaction = async () => {
    if (!amount) { showInfo('Please enter an amount'); return; }
    if (!tag)    { showInfo('Please select a tag');    return; }
    await addTransaction({ type: activeTab, tag, amount: parseFloat(amount), date: date.toISOString() });
    const txData = await getTransactions();
    setTransactions(txData);
    setAmount('');
    showToast('Transaction saved');
  };

  const handleEditTransaction = (transaction) => {
    setEditingTx(transaction);
    setIsEditOpen(true);
  };

  const saveEditTransaction = async (id, updates) => {
    await editTransaction(id, updates);
    const txData = await getTransactions();
    setTransactions(txData);
    showToast('Transaction updated');
  };

  const handleDeleteClick = (transaction) => {
    setDeletingTx(transaction);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    await deleteTransaction(deletingTx.id);
    const txData = await getTransactions();
    setTransactions(txData);
    setIsDeleteOpen(false);
    setDeletingTx(null);
    showToast('Transaction deleted', 'delete');
  };

  // ─── Tags ─────────────────────────────────────────────────────────────────
  const reloadTags = async () => {
    const tagData = await getTags();
    setAllTags(tagData);
    const typeTags = tagData.filter((t) => t.type === activeTab);
    setTags(typeTags);
    return tagData;
  };

  const handleAddTag = async (tagData) => {
    const all = await getTags();
    const colorIndex = all.length % 10;
    await addTag({ ...tagData, colorIndex });
    await reloadTags();
    showToast('Tag added');
  };

  const handleDeleteTag = async (id) => {
    await deleteTag(id);
    const tagData = await reloadTags();
    const typeTags = tagData.filter((t) => t.type === activeTab);
    if (tag && !typeTags.some((t) => t.name === tag)) {
      setTag(typeTags[0]?.name || '');
    }
    showToast('Tag deleted', 'delete');
  };

  const handleEditTag = async (id, updates) => {
    await editTag(id, updates);
    await reloadTags();
    showToast('Tag updated');
  };

  // ─── Filtered records ─────────────────────────────────────────────────────
  const filteredRecords = transactions.filter((r) => {
    if (r.type !== activeTab) return false;
    if (selectedTag && r.tag !== selectedTag) return false;
    if (balanceSelection.length > 0) {
      const d = new Date(r.date);
      if (balanceView === 'daily') {
        const txLocal = toLocalDateStr(d);
        if (!balanceSelection.some((sel) => toLocalDateStr(sel) === txLocal)) return false;
      } else if (balanceView === 'monthly') {
        const txMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!balanceSelection.includes(txMonth)) return false;
      } else if (balanceView === 'yearly') {
        if (!balanceSelection.includes(String(d.getFullYear()))) return false;
      }
    }
    return true;
  });

  // ─── Balance data ─────────────────────────────────────────────────────────
  // localDateStr is "YYYY-MM-DD" in local time
  const balanceGroupKey = (localDateStr) => {
    if (balanceView === 'monthly') return localDateStr.slice(0, 7); // YYYY-MM
    if (balanceView === 'yearly')  return localDateStr.slice(0, 4); // YYYY
    return localDateStr;                                             // YYYY-MM-DD
  };

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmtMonthKey = (key) => { const [y, m] = key.split('-'); return `${MONTH_NAMES[+m - 1]} ${y}`; };

  const balanceData = Object.values(
    transactions
      .filter((t) => {
        if (balanceSelection.length === 0) return true;
        const d = new Date(t.date);
        if (balanceView === 'daily') {
          const txLocal = toLocalDateStr(d);
          return balanceSelection.some((sel) => toLocalDateStr(sel) === txLocal);
        }
        if (balanceView === 'monthly') {
          const txMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return balanceSelection.includes(txMonth);
        }
        if (balanceView === 'yearly') {
          return balanceSelection.includes(String(d.getFullYear()));
        }
        return true;
      })
      .reduce((acc, t) => {
        const key = balanceGroupKey(toLocalDateStr(new Date(t.date)));
        if (!acc[key]) acc[key] = { date: key, income: 0, expense: 0 };
        if (t.type === 'income')  acc[key].income  += parseFloat(t.amount || 0);
        if (t.type === 'expense') acc[key].expense += parseFloat(t.amount || 0);
        return acc;
      }, {})
  ).sort((a, b) => a.date.localeCompare(b.date));

  const balanceTotals = balanceData.reduce(
    (acc, row) => ({ income: acc.income + row.income, expense: acc.expense + row.expense }),
    { income: 0, expense: 0 }
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">Budget Tracker</h1>
        <button
          onClick={() => setIsTagsOpen(true)}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Manage tags"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
      </header>

      {/* Summary cards — always visible */}
      <SummaryCards transactions={transactions} activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="px-2 sm:px-4 max-w-6xl mx-auto">

        {/* ── Global date filter — all tabs ── */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-3 bg-white dark:bg-gray-900 shadow-sm">
          {/* Tab header — Daily / Monthly / Yearly */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'daily',   label: 'Daily'   },
              { id: 'monthly', label: 'Monthly' },
              { id: 'yearly',  label: 'Yearly'  },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setBalanceView(id); setBalanceSelection([]); }}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  balanceView === id
                    ? 'border-blue-500 text-blue-500 bg-white dark:bg-gray-900'
                    : 'border-transparent text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 active:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Picker body */}
          <div className="p-3 bg-white dark:bg-gray-900">
            {balanceView === 'daily' && (
              <DatePicker
                inline
                selectsMultiple
                selectedDates={balanceSelection}
                onChange={(dates) => setBalanceSelection(dates || [])}
                shouldCloseOnSelect={false}
                dateFormat="dd MMM yyyy"
              />
            )}
            {balanceView === 'monthly' && (
              <MonthMultiPicker selected={balanceSelection} onChange={setBalanceSelection} />
            )}
            {balanceView === 'yearly' && (
              <YearMultiPicker selected={balanceSelection} onChange={setBalanceSelection} />
            )}

            {/* Selected chips */}
            {balanceSelection.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                {balanceSelection.map((item) => {
                  const label = balanceView === 'daily'
                    ? formatDate(item.toISOString())
                    : balanceView === 'monthly' ? fmtMonthKey(item) : item;
                  const key = balanceView === 'daily' ? toLocalDateStr(item) : item;
                  return (
                    <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                      {label}
                      <button
                        onClick={() => setBalanceSelection((prev) =>
                          balanceView === 'daily'
                            ? prev.filter((x) => toLocalDateStr(x) !== key)
                            : prev.filter((k) => k !== key)
                        )}
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
                <button
                  onClick={() => setBalanceSelection([])}
                  className="text-xs text-red-400 hover:text-red-500 ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Income / Expense tab ── */}
        {activeTab !== 'balance' && (
          <>
            {/* Transaction form */}
            <div className="bg-white dark:bg-gray-900 rounded-xl px-3 pt-3 pb-2 mb-3 shadow-sm space-y-2">

              {/* Row 1: Tag (full width) */}
              <Listbox value={tag} onChange={setTag}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2.5 pl-3 pr-10 text-left text-sm text-gray-800 dark:text-gray-200">
                    {tag ? (
                      (() => {
                        const found = allTags.find((t) => t.name === tag);
                        const c = found ? getTagColorClasses(found.colorIndex) : null;
                        return c ? (
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                            {tag}
                          </span>
                        ) : tag;
                      })()
                    ) : (
                      <span className="text-gray-400">Select a tag…</span>
                    )}
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-700 py-1 shadow-lg ring-1 ring-black/10 z-10 text-sm">
                      {tags.map((t) => {
                        const c = getTagColorClasses(t.colorIndex);
                        return (
                          <Listbox.Option
                            key={t.id}
                            value={t.name}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                                  {t.name}
                                </span>
                                {selected && (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                    <CheckIcon className="h-4 w-4" />
                                  </span>
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        );
                      })}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>

              {/* Row 2: Date | Amount | Save */}
              <div className="flex gap-2 items-center">
                {/* Date */}
                <DatePicker
                  selected={date}
                  onChange={setDate}
                  dateFormat="dd MMM"
                  withPortal
                  customInput={
                    <DateBtn className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 whitespace-nowrap" />
                  }
                />

                {/* Amount */}
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 min-w-0 py-2.5 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400"
                />

                {/* Save */}
                <button
                  onClick={handleAddTransaction}
                  className={`px-4 py-2.5 rounded-lg text-white font-semibold text-sm flex-shrink-0 ${
                    activeTab === 'income' ? 'bg-green-500 active:bg-green-600' : 'bg-red-500 active:bg-red-600'
                  }`}
                >
                  Save
                </button>
              </div>
            </div>

            {/* Filter + records */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm">
              <Filter
                tags={tags}
                allTags={allTags}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
              />
              {loading ? (
                <SkeletonRows count={4} />
              ) : (
                <RecordList
                  type={activeTab}
                  records={filteredRecords}
                  allTags={allTags}
                  handleDeleteTransaction={handleDeleteClick}
                  handleEditTransaction={handleEditTransaction}
                  formatDateTime={formatDate}
                />
              )}
            </div>
          </>
        )}

        {/* ── Balance tab ── */}
        {activeTab === 'balance' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm">
            <h2 className="text-base font-bold text-blue-600 dark:text-blue-400 mb-3">Balance</h2>

            {/* Chart */}
            <BalanceChart data={balanceData} view={balanceView} />

            {/* Table */}
            {loading ? (
              <SkeletonRows count={4} />
            ) : balanceData.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-10 text-sm">No data for the selected range.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">
                        {balanceView === 'yearly' ? 'Year' : balanceView === 'monthly' ? 'Month' : 'Date'}
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 p-2 text-right">Income</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-2 text-right">Expense</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-2 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balanceData.map((row) => {
                      const net = row.income - row.expense;
                      return (
                        <tr key={row.date} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {balanceView === 'monthly'
                              ? new Date(row.date + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                              : row.date}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-right text-green-600 dark:text-green-400">{new Intl.NumberFormat().format(row.income)}</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-right text-red-600 dark:text-red-400">{new Intl.NumberFormat().format(row.expense)}</td>
                          <td className={`border border-gray-300 dark:border-gray-600 p-2 text-right font-bold ${net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                            {new Intl.NumberFormat().format(net)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 dark:bg-gray-700 font-bold text-gray-700 dark:text-gray-200">
                      <td className="border border-gray-300 dark:border-gray-600 p-2">Total</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-right text-green-600 dark:text-green-400">{new Intl.NumberFormat().format(balanceTotals.income)}</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-right text-red-600 dark:text-red-400">{new Intl.NumberFormat().format(balanceTotals.expense)}</td>
                      <td className={`border border-gray-300 dark:border-gray-600 p-2 text-right ${(balanceTotals.income - balanceTotals.expense) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                        {new Intl.NumberFormat().format(balanceTotals.income - balanceTotals.expense)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onChange={handleTabChange} />

      {/* Modals */}
      <EditTransactionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={saveEditTransaction}
        transaction={editingTx}
        tags={allTags.filter((t) => t.type === (editingTx?.type || activeTab))}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        transaction={deletingTx}
      />

      <TagsManagementModal
        isOpen={isTagsOpen}
        onClose={() => setIsTagsOpen(false)}
        allTags={allTags}
        onAdd={handleAddTag}
        onDelete={handleDeleteTag}
        onEdit={handleEditTag}
        activeType={activeTab !== 'balance' ? activeTab : 'income'}
      />

      <InfoModal
        isOpen={isInfoOpen}
        message={infoMessage}
        onClose={() => setIsInfoOpen(false)}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default App;
