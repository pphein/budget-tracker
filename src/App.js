import React, { useState, useEffect, useRef, forwardRef, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, Cog6ToothIcon } from '@heroicons/react/20/solid';
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
import { getTagColorClasses } from './utils/tagColors';

import {
  addTransaction, getTransactions, deleteTransaction, editTransaction,
  getTags, addTag, deleteTag, editTag,
} from './db';

// ─── Dark mode: follow system preference ──────────────────────────────────────
const applyDark = (e) => document.documentElement.classList.toggle('dark', e.matches);

const App = () => {
  const [activeTab, setActiveTab]       = useState('income');
  const [transactions, setTransactions] = useState([]);
  const [allTags, setAllTags]           = useState([]);   // every tag regardless of type
  const [tags, setTags]                 = useState([]);   // tags for active type
  const [tag, setTag]                   = useState('');
  const [amount, setAmount]             = useState('');
  const [date, setDate]                 = useState(new Date());
  const [selectedTag, setSelectedTag]   = useState('');
  const [filterStart, setFilterStart]   = useState(null);
  const [filterEnd, setFilterEnd]       = useState(null);
  const [balanceStart, setBalanceStart] = useState(null);
  const [balanceEnd, setBalanceEnd]     = useState(null);
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
    if (filterStart && new Date(r.date) < new Date(filterStart)) return false;
    if (filterEnd   && new Date(r.date) > new Date(filterEnd))   return false;
    return true;
  });

  // ─── Balance data ─────────────────────────────────────────────────────────
  const balanceData = Object.values(
    transactions.reduce((acc, t) => {
      const day = new Date(t.date).toISOString().split('T')[0];
      if (!acc[day]) acc[day] = { date: day, income: 0, expense: 0 };
      if (t.type === 'income')  acc[day].income  += parseFloat(t.amount || 0);
      if (t.type === 'expense') acc[day].expense += parseFloat(t.amount || 0);
      return acc;
    }, {})
  )
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter((row) => {
      if (!balanceStart || !balanceEnd) return true;
      const d = new Date(row.date);
      return d >= new Date(balanceStart) && d <= new Date(balanceEnd);
    });

  const balanceTotals = balanceData.reduce(
    (acc, row) => ({ income: acc.income + row.income, expense: acc.expense + row.expense }),
    { income: 0, expense: 0 }
  );

  // Custom date picker inputs (buttons — prevent keyboard on mobile)
  const DateBtn = forwardRef(({ value, onClick, className }, ref) => (
    <button className={className} onClick={onClick} ref={ref}>{value}</button>
  ));

  const BalanceDateBtn = forwardRef(({ value, onClick }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className="w-full text-left p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
    >
      {value || 'All dates'}
    </button>
  ));

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

        {/* ── Income / Expense tab ── */}
        {activeTab !== 'balance' && (
          <>
            {/* Transaction form */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-3 mb-3 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">

                {/* Tag selector */}
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tag</label>
                  <Listbox value={tag} onChange={setTag}>
                    <div className="relative">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left text-sm shadow-sm text-gray-800 dark:text-gray-200">
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
                          <span className="text-gray-400">Select a tag</span>
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
                </div>

                {/* Date picker */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date</label>
                  <DatePicker
                    selected={date}
                    onChange={setDate}
                    dateFormat="dd-MM-yyyy"
                    withPortal
                    customInput={
                      <DateBtn className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 w-full" />
                    }
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Amount</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full sm:w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>

                {/* Save button */}
                <button
                  onClick={handleAddTransaction}
                  className={`px-4 py-2 rounded-lg text-white font-medium text-sm ${
                    activeTab === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
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
                setStartDate={setFilterStart}
                setEndDate={setFilterEnd}
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-blue-600 dark:text-blue-400">Daily Balance</h2>
            </div>

            {/* Balance date range */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date Range</label>
              <DatePicker
                selectsRange
                startDate={balanceStart ? new Date(balanceStart) : null}
                endDate={balanceEnd ? new Date(balanceEnd) : null}
                onChange={([start, end]) => {
                  setBalanceStart(start ? start.toISOString().slice(0, 10) : null);
                  setBalanceEnd(end ? end.toISOString() : null);
                }}
                isClearable
                withPortal
                dateFormat="dd-MM-yyyy"
                customInput={
                  <BalanceDateBtn />
                }
              />
            </div>

            {/* Chart */}
            <BalanceChart data={balanceData} />

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
                      <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Date</th>
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
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-gray-700 dark:text-gray-300">{row.date}</td>
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
