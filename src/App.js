import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Cog6ToothIcon, ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { ChevronRightIcon, MagnifyingGlassIcon, XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
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
import SettingsModal from './components/SettingsModal';
import PinScreen from './components/PinScreen';
import PinSetupModal from './components/PinSetupModal';
import BalanceChart from './components/BalanceChart';
import SavingsRateCard from './components/SavingsRateCard';
import BudgetForecast from './components/BudgetForecast';
import MonthComparison from './components/MonthComparison';
import TopSpendingTags from './components/TopSpendingTags';
import CashFlowCalendar from './components/CashFlowCalendar';
import IncomeStabilityCard from './components/IncomeStabilityCard';
import RecurringVsOneOff from './components/RecurringVsOneOff';
import TagExpenseHeatmap from './components/TagExpenseHeatmap';
import SkeletonRows from './components/SkeletonRows';
import TagSelect from './components/TagSelect';
import NumPad from './components/NumPad';
import { getInitialColorTheme, applyColorTheme } from './utils/colorTheme';
import { getGoldPrices, saveGoldPrices } from './utils/goldPrice';
import { getCachedRates, saveRates, fetchExchangeRates } from './utils/exchangeRate';
import { getTaxSettings, saveTaxSettings } from './utils/taxCalculator';
import { isPinEnabled, shouldLockNow, recordActivity } from './utils/pin';
import { getBudgetLimits } from './utils/budgetLimits';
import { processDueRecurring } from './utils/recurring';
import GoldPriceBar from './components/GoldPriceBar';
import ExchangeRateBar from './components/ExchangeRateBar';
import GoldPriceChart from './components/GoldPriceChart';
import ExchangeRateChart from './components/ExchangeRateChart';
import OilPriceChart from './components/OilPriceChart';
import CurrencyConverter from './components/CurrencyConverter';
import TaxCard from './components/TaxCard';
import SpendingPieChart from './components/SpendingPieChart';
import SpendingInsights from './components/SpendingInsights';
import HabitsCard from './components/HabitsCard';
import TagTrendChart from './components/TagTrendChart';
import SavingsGoals from './components/SavingsGoals';
import SavingsGoalsModal from './components/SavingsGoalsModal';
import RemindersModal from './components/RemindersModal';
import TemplatesModal from './components/TemplatesModal';
import MonthlyReportModal from './components/MonthlyReportModal';
import CSVImportModal from './components/CSVImportModal';
import { getTemplates, addTemplate, deleteTemplate } from './utils/templates';
import { getGoals, addGoal, deleteGoal } from './utils/goals';
import { getReminders, addReminder, dismissReminder, deleteReminder } from './utils/reminders';
import BudgetProgress from './components/BudgetProgress';
import BudgetLimitsModal from './components/BudgetLimitsModal';
import RecurringModal from './components/RecurringModal';
import {
  addTransaction, getTransactions, deleteTransaction, editTransaction,
  getTags, addTag, deleteTag, editTag, syncDefaultTags,
} from './db';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Theme helpers ────────────────────────────────────────────────────────────
const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

// ─── Custom datepicker input — defined outside App to keep stable reference ──
const DateBtn = forwardRef(({ value, onClick, className }, ref) => (
  <button className={className} onClick={onClick} ref={ref}>{value}</button>
));


const compressImage = (file) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('Not an image')); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const App = () => {
  const [activeTab, setActiveTab]       = useState('income');
  const [transactions, setTransactions] = useState([]);
  const [allTags, setAllTags]           = useState([]);
  const [tags, setTags]                 = useState([]);
  const [tag, setTag]                   = useState('');
  const [amount, setAmount]             = useState('');
  const [date, setDate]                 = useState(new Date());
  const [selectedTags, setSelectedTags] = useState([]);
  const [filterYears, setFilterYears]   = useState([new Date().getFullYear()]);
  const [filterMonths, setFilterMonths] = useState([new Date().getMonth() + 1]);
  const [filterOpen, setFilterOpen]     = useState(false);
  const [balanceView, setBalanceView]   = useState('monthly');
  const [loading, setLoading]           = useState(true);
  const [theme, setTheme]               = useState(getInitialTheme);
  const [colorTheme, setColorTheme]     = useState(getInitialColorTheme);
  const [goldPrices, setGoldPrices]         = useState(getGoldPrices);
  const [exchangeRates, setExchangeRates]   = useState(() => getCachedRates());
  const [ratesLoading, setRatesLoading]     = useState(false);
  const [showGoldBar, setShowGoldBar]         = useState(() => localStorage.getItem('showGoldBar') !== 'false');
  const [showExchangeBar, setShowExchangeBar] = useState(() => localStorage.getItem('showExchangeBar') !== 'false');
  const [showGoldChart, setShowGoldChart]         = useState(() => localStorage.getItem('showGoldChart') === 'true');
  const [showExchangeChart, setShowExchangeChart] = useState(() => localStorage.getItem('showExchangeChart') === 'true');
  const [showOilChart, setShowOilChart]                   = useState(() => localStorage.getItem('showOilChart') === 'true');
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(() => localStorage.getItem('showCurrencyConverter') === 'true');
  const [featureRecurring,    setFeatureRecurring]    = useState(() => localStorage.getItem('featureRecurring')    === 'true');
  const [featureSplit,        setFeatureSplit]        = useState(() => localStorage.getItem('featureSplit')        === 'true');
  const [featureTemplates,    setFeatureTemplates]    = useState(() => localStorage.getItem('featureTemplates')    === 'true');
  const [featureBudgetLimits, setFeatureBudgetLimits] = useState(() => localStorage.getItem('featureBudgetLimits') === 'true');
  const [featureCSVImport,    setFeatureCSVImport]    = useState(() => localStorage.getItem('featureCSVImport')    === 'true');
  const [featureSearchNotes,  setFeatureSearchNotes]  = useState(() => localStorage.getItem('featureSearchNotes')  === 'true');
  const [featureTagFilter,    setFeatureTagFilter]    = useState(() => localStorage.getItem('featureTagFilter')    === 'true');
  const [taxSettings, setTaxSettings]         = useState(getTaxSettings);
  const [notes, setNotes]                     = useState('');
  const [budgetLimits, setBudgetLimits]       = useState(() => getBudgetLimits());
  const [isRecurringOpen, setIsRecurringOpen]         = useState(false);
  const [isBudgetLimitsOpen, setIsBudgetLimitsOpen]   = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  // PIN / lock
  const [isLocked, setIsLocked]               = useState(false);
  const [isPinSetupOpen, setIsPinSetupOpen]   = useState(false);
  const [pinSetupMode, setPinSetupMode]       = useState('setup'); // 'setup' | 'change'

  // Modals
  const [editingTx, setEditingTx]               = useState(null);
  const [isEditOpen, setIsEditOpen]             = useState(false);
  const [deletingTx, setDeletingTx]             = useState(null);
  const [isDeleteOpen, setIsDeleteOpen]         = useState(false);
  const [isTagsOpen, setIsTagsOpen]             = useState(false);
  const [isSettingsOpen, setIsSettingsOpen]     = useState(false);
  const [infoMessage, setInfoMessage]           = useState('');
  const [isInfoOpen, setIsInfoOpen]             = useState(false);
  const [toast, setToast]                       = useState(null);

  const [searchQuery, setSearchQuery]       = useState('');
  const [txCurrency, setTxCurrency]         = useState('MMK');
  const [attachment, setAttachment]         = useState('');
  const [splitMode, setSplitMode]           = useState(false);
  const [splitRows, setSplitRows]           = useState([{ tag: '', amount: '' }, { tag: '', amount: '' }]);
  const [templates, setTemplates]           = useState(() => getTemplates());
  const [goals, setGoals]                   = useState(() => getGoals());
  const [reminders, setReminders]           = useState(() => getReminders());
  const [isGoalsOpen, setIsGoalsOpen]       = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isReportOpen, setIsReportOpen]     = useState(false);
  const [isCSVOpen, setIsCSVOpen]           = useState(false);
  const [overdueReminders, setOverdueReminders] = useState([]);

  const tabs          = ['income', 'expense', 'balance'];
  const touchStartX   = useRef(null);
  const touchStartY   = useRef(null);
  const isScrolling   = useRef(false);
  const attachInputRef = useRef(null);

  // ─── PIN lock ─────────────────────────────────────────────────────────────
  // Lock on mount if PIN is enabled
  useEffect(() => {
    if (isPinEnabled()) setIsLocked(true);
  }, []);

  // Lock on visibility restore if auto-lock timeout has elapsed
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && shouldLockNow()) setIsLocked(true);
      if (document.hidden) recordActivity(); // stamp when leaving
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Record activity on any touch/click so auto-lock timeout resets
  const handleUserActivity = () => { if (!isLocked) recordActivity(); };

  const handleUnlock = () => {
    recordActivity();
    setIsLocked(false);
  };

  const handleSetupPin = () => {
    setPinSetupMode('setup');
    setIsPinSetupOpen(true);
  };

  const handleChangePin = () => {
    setPinSetupMode('change');
    setIsPinSetupOpen(true);
  };

  const handlePinSetupSuccess = () => {
    setIsLocked(false); // already "logged in" after setting PIN
  };

  // Apply dark/light theme
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply color theme
  useEffect(() => {
    applyColorTheme(colorTheme);
  }, [colorTheme]);

  const handleColorThemeChange = (id) => {
    setColorTheme(id);
    applyColorTheme(id);
  };

  const handleSaveGoldPrices = (prices) => {
    const saved = saveGoldPrices(prices);
    setGoldPrices(saved);
  };

  const handleToggleGoldBar = (val) => {
    setShowGoldBar(val);
    localStorage.setItem('showGoldBar', val);
  };

  const handleToggleExchangeBar = (val) => {
    setShowExchangeBar(val);
    localStorage.setItem('showExchangeBar', val);
  };

  const handleToggleGoldChart = (val) => {
    setShowGoldChart(val);
    localStorage.setItem('showGoldChart', val);
  };

  const handleToggleExchangeChart = (val) => {
    setShowExchangeChart(val);
    localStorage.setItem('showExchangeChart', val);
  };

  const handleToggleOilChart = (val) => {
    setShowOilChart(val);
    localStorage.setItem('showOilChart', val);
  };

  const handleToggleCurrencyConverter = (val) => {
    setShowCurrencyConverter(val);
    localStorage.setItem('showCurrencyConverter', val);
  };

  const handleToggleFeatureRecurring    = (val) => { setFeatureRecurring(val);    localStorage.setItem('featureRecurring',    val); };
  const handleToggleFeatureSplit        = (val) => { setFeatureSplit(val);        localStorage.setItem('featureSplit',        val); };
  const handleToggleFeatureTemplates    = (val) => { setFeatureTemplates(val);    localStorage.setItem('featureTemplates',    val); };
  const handleToggleFeatureBudgetLimits = (val) => { setFeatureBudgetLimits(val); localStorage.setItem('featureBudgetLimits', val); };
  const handleToggleFeatureCSVImport    = (val) => { setFeatureCSVImport(val);    localStorage.setItem('featureCSVImport',    val); };
  const handleToggleFeatureSearchNotes  = (val) => { setFeatureSearchNotes(val);  localStorage.setItem('featureSearchNotes',  val); if (!val) setSearchQuery(''); };
  const handleToggleFeatureTagFilter    = (val) => { setFeatureTagFilter(val);    localStorage.setItem('featureTagFilter',    val); if (!val) setSelectedTags([]); };

  const handleTaxSettingsChange = (updated) => {
    const saved = saveTaxSettings(updated);
    setTaxSettings(saved);
  };

  // Process due recurring transactions on mount
  useEffect(() => {
    const toCreate = processDueRecurring();
    if (toCreate.length === 0) return;
    Promise.all(toCreate.map((tx) => addTransaction(tx)))
      .then(() => getTransactions())
      .then((txData) => {
        setTransactions(txData);
        showToast(`${toCreate.length} recurring transaction${toCreate.length > 1 ? 's' : ''} added`);
      })
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check overdue reminders on mount
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const overdue = reminders.filter((r) => !r.dismissed && r.date <= today);
    if (overdue.length > 0) setOverdueReminders(overdue);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch exchange rates on mount if cache is stale
  useEffect(() => {
    if (getCachedRates()) return; // already fresh
    setRatesLoading(true);
    fetchExchangeRates()
      .then((rates) => setExchangeRates(saveRates(rates)))
      .catch(console.error)
      .finally(() => setRatesLoading(false));
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => setToast({ message, type });

  const exportBalance = async () => {
    const [XLSX, { saveAs }] = await Promise.all([import('xlsx'), import('file-saver')]);
    const rows = balanceData.map((row) => ({
      Date:    row.date,
      Income:  row.income,
      Expense: row.expense,
      Net:     row.income - row.expense,
    }));
    rows.push({ Date: 'Total', Income: balanceTotals.income, Expense: balanceTotals.expense, Net: balanceTotals.income - balanceTotals.expense });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Balance');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const ySuffix = filterYears.length === 0 ? 'all' : filterYears.join('-');
    const mSuffix = filterMonths.length === 0 ? 'all' : filterMonths.map((m) => String(m).padStart(2,'0')).join('-');
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `balance-${ySuffix}-${mSuffix}.xlsx`);
  };

  const showInfo = (message) => { setInfoMessage(message); setIsInfoOpen(true); };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'numeric', day: '2-digit',
    });
  };

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
    setSelectedTags([]);
  };

  // ─── Transactions ─────────────────────────────────────────────────────────
  const handleAddTransaction = async () => {
    if (!amount) { showInfo('Please enter an amount'); return; }
    if (!tag)    { showInfo('Please select a tag');    return; }
    const allRates     = exchangeRates?.rates ? { ...exchangeRates.rates, USD: 1 } : null;
    const enteredAmt   = parseFloat(amount);
    const isForeign    = txCurrency !== 'MMK' && allRates;
    // Convert to MMK: enteredAmt * (MMK_rate / txCurrency_rate)
    const storedAmount = (isForeign && allRates[txCurrency])
      ? enteredAmt * ((allRates['MMK'] || 1) / allRates[txCurrency])
      : enteredAmt;
    await addTransaction({
      type: activeTab, tag, amount: storedAmount, date: date.toISOString(), notes,
      currency:    isForeign ? txCurrency  : undefined,
      origAmount:  isForeign ? enteredAmt  : undefined,
      attachment:  attachment || undefined,
    });
    const txData = await getTransactions();
    setTransactions(txData);
    setAmount('');
    setNotes('');
    setAttachment('');
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

  const handleSyncTags = async () => {
    const updated = await syncDefaultTags();
    setAllTags(updated);
    const typeTags = updated.filter((t) => t.type === activeTab);
    setTags(typeTags);
    showToast('Tags synced');
  };

  // ─── Templates ────────────────────────────────────────────────────────────
  const handleAddTemplate  = (tpl) => setTemplates(addTemplate(tpl));
  const handleDelTemplate  = (id)  => setTemplates(deleteTemplate(id));

  // ─── Goals ────────────────────────────────────────────────────────────────
  const handleAddGoal  = (g)  => setGoals(addGoal(g));
  const handleDelGoal  = (id) => setGoals(deleteGoal(id));

  // ─── Reminders ────────────────────────────────────────────────────────────
  const handleAddReminder     = (r)  => setReminders(addReminder(r));
  const handleDismissReminder = (id) => setReminders(dismissReminder(id));
  const handleDelReminder     = (id) => setReminders(deleteReminder(id));

  // ─── CSV import ───────────────────────────────────────────────────────────
  const handleCSVImport = async (rows) => {
    await Promise.all(rows.map((r) => addTransaction(r)));
    const txData = await getTransactions();
    setTransactions(txData);
    showToast(`${rows.length} transactions imported`);
  };

  // ─── Split transaction save ────────────────────────────────────────────────
  const handleSaveSplit = async () => {
    const valid = splitRows.filter((r) => r.tag && r.amount && parseFloat(r.amount) > 0);
    if (valid.length < 2) { showInfo('Add at least 2 split rows with tag and amount'); return; }
    await Promise.all(valid.map((r) => addTransaction({
      type: activeTab, tag: r.tag, amount: parseFloat(r.amount),
      date: date.toISOString(), notes,
    })));
    const txData = await getTransactions();
    setTransactions(txData);
    setSplitMode(false);
    setSplitRows([{ tag: '', amount: '' }, { tag: '', amount: '' }]);
    setNotes('');
    showToast(`${valid.length} split transactions saved`);
  };

  // ─── Shared year+month filter ──────────────────────────────────────────────
  const matchesFilter = (isoDate) => {
    const d = new Date(isoDate);
    if (filterYears.length > 0 && !filterYears.includes(d.getFullYear())) return false;
    if (filterMonths.length > 0 && !filterMonths.includes(d.getMonth() + 1)) return false;
    return true;
  };

  const toggleYear  = (y) => setFilterYears((prev) =>
    prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y].sort((a, b) => a - b));
  const toggleMonth = (m) => setFilterMonths((prev) =>
    prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].sort((a, b) => a - b));

  // ─── Filtered records ─────────────────────────────────────────────────────
  const filteredRecords = transactions.filter((r) => {
    if (r.type !== activeTab) return false;
    if (selectedTags.length > 0 && !selectedTags.includes(r.tag)) return false;
    if (!matchesFilter(r.date)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!r.tag.toLowerCase().includes(q) && !(r.notes || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // ─── Balance data — grouped by balanceView ────────────────────────────────
  const balanceGroupKey = (localDateStr) => {
    if (balanceView === 'yearly')  return localDateStr.slice(0, 4);
    if (balanceView === 'monthly') return localDateStr.slice(0, 7);
    return localDateStr;
  };

  const balanceData = Object.values(
    transactions
      .filter((t) => matchesFilter(t.date))
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
  // Show PIN lock screen — nothing else rendered beneath it
  if (isLocked) return <PinScreen onUnlock={handleUnlock} />;

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleUserActivity}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">Budget Tracker</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Settings"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
      </header>

      {/* ── Global year + month filter ── */}
      <div className="px-2 sm:px-4 max-w-6xl mx-auto mt-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
          {/* Collapsed header — always visible */}
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            <span>
              {(() => {
                const yLabel = filterYears.length === 0 ? 'All years' : filterYears.join(', ');
                const mLabel = filterMonths.length === 0 ? 'All months'
                  : filterMonths.length <= 3 ? filterMonths.map((m) => MONTH_LABELS[m - 1]).join(', ')
                  : `${filterMonths.length} months`;
                return `${mLabel} · ${yLabel}`;
              })()}
            </span>
            <ChevronRightIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${filterOpen ? 'rotate-90' : ''}`} />
          </button>

          {/* Expanded picker */}
          {filterOpen && (
            <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700 pt-2 space-y-3">
              {/* Year pills — multi-select */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Year</span>
                  {filterYears.length > 0 && (
                    <button onClick={() => setFilterYears([])} className="text-xs text-red-400">Clear</button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 6 + i).map((y) => (
                    <button
                      key={y}
                      onClick={() => toggleYear(y)}
                      className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                        filterYears.includes(y)
                          ? 'bg-[var(--primary-500)] text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-600'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month pills — multi-select */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Month</span>
                  {filterMonths.length > 0 && (
                    <button onClick={() => setFilterMonths([])} className="text-xs text-red-400">Clear</button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {MONTH_LABELS.map((label, i) => (
                    <button
                      key={label}
                      onClick={() => toggleMonth(i + 1)}
                      className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                        filterMonths.includes(i + 1)
                          ? 'bg-[var(--primary-500)] text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gold price bar */}
      {showGoldBar && (
        <GoldPriceBar
          worldPrice={goldPrices.worldPrice}
          myanmarPrice={goldPrices.myanmarPrice}
          updatedAt={goldPrices.updatedAt}
        />
      )}

      {/* Exchange rate bar */}
      {showExchangeBar && (
        <ExchangeRateBar
          rates={exchangeRates?.rates}
          updatedAt={exchangeRates?.updatedAt}
          loading={ratesLoading}
        />
      )}

      {/* Gold price chart */}
      {showGoldChart && <GoldPriceChart />}

      {/* Exchange rate chart */}
      {showExchangeChart && <ExchangeRateChart />}

      {/* Oil price chart */}
      {showOilChart && <OilPriceChart />}

      {/* Currency converter */}
      {showCurrencyConverter && (
        <CurrencyConverter rates={exchangeRates?.rates} />
      )}

      {/* Summary cards — filtered by selected year + month */}
      <SummaryCards transactions={transactions.filter((t) => matchesFilter(t.date))} activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="px-2 sm:px-4 max-w-6xl mx-auto">

        {/* ── Income / Expense tab ── */}
        {activeTab !== 'balance' && (
          <>
            {/* Transaction form */}
            <div className="bg-white dark:bg-gray-900 rounded-xl px-3 pt-3 pb-2 mb-3 shadow-sm space-y-2">

              {/* Quick-add: Templates (if enabled) + recent transactions */}
              {(() => {
                const typeTpl = featureTemplates ? templates.filter((t) => t.type === activeTab) : [];
                const seen = new Set();
                const recent = [];
                for (const t of [...transactions].reverse()) {
                  if (t.type !== activeTab) continue;
                  const key = `${t.tag}|${t.amount}`;
                  if (!seen.has(key) && recent.length < 4) { seen.add(key); recent.push(t); }
                }
                const all = [...typeTpl.map((t) => ({ ...t, _isTemplate: true })), ...recent];
                if (all.length === 0) return null;
                return (
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                    {all.map((t) => (
                      <button
                        key={t._isTemplate ? `tpl-${t.id}` : `tx-${t.id}`}
                        type="button"
                        onClick={() => { setTag(t.tag); setAmount(String(t.amount)); if (t.notes) setNotes(t.notes); }}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-left active:opacity-80 ${t._isTemplate ? 'bg-[var(--primary-50)] dark:bg-[var(--primary-900)]/30 border border-[var(--primary-200)] dark:border-[var(--primary-700)]' : 'bg-gray-100 dark:bg-gray-800'}`}
                      >
                        <span className="block text-xs font-medium text-gray-700 dark:text-gray-200">{t._isTemplate ? t.label : t.tag}</span>
                        <span className="block text-xs text-gray-400 dark:text-gray-500">{new Intl.NumberFormat().format(t.amount)}</span>
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Row 1: Tag (full width, searchable) */}
              <TagSelect tags={tags} value={tag} onChange={setTag} />

              {/* Currency row — only when exchange rates are available */}
              {exchangeRates?.rates && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">Currency</span>
                  <select
                    value={txCurrency}
                    onChange={(e) => setTxCurrency(e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none"
                  >
                    {['MMK', 'USD', ...Object.keys(exchangeRates.rates).filter((c) => c !== 'MMK')].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {txCurrency !== 'MMK' && amount && exchangeRates.rates['MMK'] && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ≈ {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
                        parseFloat(amount) * (exchangeRates.rates['MMK'] / (exchangeRates.rates[txCurrency] || 1))
                      )} MMK
                    </span>
                  )}
                </div>
              )}

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
                <NumPad value={amount} onChange={setAmount} />

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

              {/* Row 3: Note + Attach */}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Note (optional)"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => attachInputRef.current?.click()}
                  className={`p-2 rounded-lg border flex-shrink-0 ${attachment ? 'border-[var(--primary-500)] text-[var(--primary-500)]' : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'}`}
                >
                  <CameraIcon className="w-5 h-5" />
                </button>
                <input
                  ref={attachInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        setAttachment(await compressImage(file));
                      } catch {
                        showInfo('Please select a valid image file.');
                      }
                    }
                    e.target.value = '';
                  }}
                />
              </div>

              {/* Attachment preview */}
              {attachment && (
                <div className="relative inline-block">
                  <img src={attachment} alt="receipt" className="h-20 rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={() => setAttachment('')}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Split transaction panel */}
              {featureSplit && splitMode && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Split Transaction</p>
                  {splitRows.map((row, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select
                        value={row.tag}
                        onChange={(e) => setSplitRows((prev) => prev.map((r, j) => j === i ? { ...r, tag: e.target.value } : r))}
                        className="flex-1 px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                      >
                        <option value="">Tag…</option>
                        {tags.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                      </select>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={row.amount}
                        onChange={(e) => setSplitRows((prev) => prev.map((r, j) => j === i ? { ...r, amount: e.target.value } : r))}
                        className="w-24 px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                      />
                      {splitRows.length > 2 && (
                        <button type="button" onClick={() => setSplitRows((prev) => prev.filter((_, j) => j !== i))} className="text-red-400 text-xs">✕</button>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 justify-between items-center">
                    <button type="button" onClick={() => setSplitRows((prev) => [...prev, { tag: '', amount: '' }])}
                      className="text-xs text-[var(--primary-500)] font-medium">+ Add row</button>
                    <span className="text-xs text-gray-400">
                      Total: {new Intl.NumberFormat().format(splitRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0))}
                    </span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setSplitMode(false)} className="px-3 py-1.5 text-xs rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Cancel</button>
                      <button type="button" onClick={handleSaveSplit}
                        className={`px-3 py-1.5 text-xs rounded-lg text-white font-medium ${activeTab === 'income' ? 'bg-green-500' : 'bg-red-500'}`}>Save All</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Row 4: Quick actions (only show enabled add-ons) */}
              {(featureRecurring || featureSplit || featureTemplates || (featureBudgetLimits && activeTab === 'expense') || featureCSVImport) && (
                <div className="flex flex-wrap gap-2 pt-0.5 pb-1">
                  {featureRecurring && (
                    <button onClick={() => setIsRecurringOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium active:bg-gray-200 dark:active:bg-gray-700">
                      Recurring
                    </button>
                  )}
                  {featureSplit && (
                    <button onClick={() => setSplitMode((s) => !s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium active:opacity-80 ${splitMode ? 'bg-[var(--primary-100)] dark:bg-[var(--primary-900)]/30 text-[var(--primary-600)] dark:text-[var(--primary-400)]' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                      Split
                    </button>
                  )}
                  {featureTemplates && (
                    <button onClick={() => setIsTemplatesOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium active:bg-gray-200 dark:active:bg-gray-700">
                      Templates
                    </button>
                  )}
                  {featureBudgetLimits && activeTab === 'expense' && (
                    <button onClick={() => setIsBudgetLimitsOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium active:bg-gray-200 dark:active:bg-gray-700">
                      Budget Limits
                    </button>
                  )}
                  {featureCSVImport && (
                    <button onClick={() => setIsCSVOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium active:bg-gray-200 dark:active:bg-gray-700">
                      Import CSV
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Tax card — income tab only */}
            {activeTab === 'income' && taxSettings.enabled && (
              <div className="mb-3">
                <TaxCard
                  monthlyIncome={transactions.filter((t) => matchesFilter(t.date) && t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0)}
                  country={taxSettings.country}
                />
              </div>
            )}

            {/* Budget progress — expense tab only, when feature enabled */}
            {activeTab === 'expense' && featureBudgetLimits && (
              <BudgetProgress
                expenseByTag={transactions
                  .filter((t) => t.type === 'expense' && matchesFilter(t.date))
                  .reduce((acc, t) => {
                    acc[t.tag] = (acc[t.tag] || 0) + parseFloat(t.amount || 0);
                    return acc;
                  }, {})}
                limits={budgetLimits}
              />
            )}

            {/* Filter + records */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm">
              {/* Search */}
              {featureSearchNotes && (
                <div className="flex items-center gap-2 px-3 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tag or note…"
                    className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-gray-400 flex-shrink-0">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {featureTagFilter && (
                <Filter
                  tags={tags}
                  allTags={allTags}
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
                />
              )}
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
          <>
          <SpendingInsights transactions={transactions} />
          <HabitsCard transactions={transactions} />
          <SavingsGoals goals={goals} transactions={transactions} onManage={() => setIsGoalsOpen(true)} />
          <TagTrendChart transactions={transactions} allTags={allTags} />

          {/* ── New tracking features ── */}
          <div className="flex gap-3 mb-3">
            <SavingsRateCard transactions={transactions} filterYears={filterYears} filterMonths={filterMonths} />
            <BudgetForecast  transactions={transactions} filterYears={filterYears} filterMonths={filterMonths} budgetLimits={budgetLimits} />
          </div>
          <MonthComparison transactions={transactions} filterYears={filterYears} filterMonths={filterMonths} />
          <div className="mb-3" />
          <TopSpendingTags transactions={transactions} allTags={allTags} filterYears={filterYears} filterMonths={filterMonths} />
          <div className="mb-3" />
          {featureRecurring && (
            <RecurringVsOneOff transactions={transactions} filterYears={filterYears} filterMonths={filterMonths} />
          )}
          <div className="mb-3" />
          <IncomeStabilityCard transactions={transactions} />
          <div className="mb-3" />
          <CashFlowCalendar transactions={transactions} filterYears={filterYears} filterMonths={filterMonths} />
          <div className="mb-3" />
          <TagExpenseHeatmap transactions={transactions} allTags={allTags} filterYears={filterYears} />
          <div className="mb-3" />
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-[var(--primary-600)] dark:text-[var(--primary-400)]">Balance</h2>
              <div className="flex gap-2">
                <button onClick={() => setIsRemindersOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium active:bg-gray-200">
                  {reminders.filter((r) => !r.dismissed && r.date <= new Date().toISOString().slice(0,10)).length > 0
                    ? <span className="w-2 h-2 rounded-full bg-red-500 mr-0.5" />
                    : null}
                  Reminders
                </button>
                <button onClick={() => setIsReportOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium active:bg-gray-200">
                  Report
                </button>
                {balanceData.length > 0 && (
                  <button onClick={exportBalance}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500 active:bg-green-600 text-white text-xs font-medium">
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                    Export
                  </button>
                )}
              </div>
            </div>

            {/* View toggle — Daily / Monthly / Yearly */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-3">
              {[['daily','Daily'],['monthly','Monthly'],['yearly','Yearly']].map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setBalanceView(v)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    balanceView === v
                      ? 'bg-[var(--primary-500)] text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Chart */}
            <BalanceChart data={balanceData} view={balanceView} />

            {/* Spending breakdown */}
            <SpendingPieChart
              transactions={transactions.filter((t) => matchesFilter(t.date))}
              allTags={allTags}
              type="expense"
            />

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
                            <td className={`border border-gray-300 dark:border-gray-600 p-2 text-right font-bold ${net >= 0 ? 'text-[var(--primary-600)] dark:text-[var(--primary-400)]' : 'text-red-600 dark:text-red-400'}`}>
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
                      <td className={`border border-gray-300 dark:border-gray-600 p-2 text-right ${(balanceTotals.income - balanceTotals.expense) >= 0 ? 'text-[var(--primary-600)] dark:text-[var(--primary-400)]' : 'text-red-600 dark:text-red-400'}`}>
                        {new Intl.NumberFormat().format(balanceTotals.income - balanceTotals.expense)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          </>
        )}
      </main>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onChange={handleTabChange} />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        colorTheme={colorTheme}
        onColorThemeChange={handleColorThemeChange}
        onManageTags={() => setIsTagsOpen(true)}
        installPrompt={installPrompt}
        onInstall={handleInstall}
        goldPrices={goldPrices}
        onSaveGoldPrices={handleSaveGoldPrices}
        showGoldBar={showGoldBar}
        onToggleGoldBar={handleToggleGoldBar}
        showExchangeBar={showExchangeBar}
        onToggleExchangeBar={handleToggleExchangeBar}
        showGoldChart={showGoldChart}
        onToggleGoldChart={handleToggleGoldChart}
        showExchangeChart={showExchangeChart}
        onToggleExchangeChart={handleToggleExchangeChart}
        showOilChart={showOilChart}
        onToggleOilChart={handleToggleOilChart}
        showCurrencyConverter={showCurrencyConverter}
        onToggleCurrencyConverter={handleToggleCurrencyConverter}
        taxSettings={taxSettings}
        onTaxSettingsChange={handleTaxSettingsChange}
        onSetupPin={handleSetupPin}
        onChangePin={handleChangePin}
        onStorageChange={loadAll}
        featureRecurring={featureRecurring}         onToggleFeatureRecurring={handleToggleFeatureRecurring}
        featureSplit={featureSplit}                 onToggleFeatureSplit={handleToggleFeatureSplit}
        featureTemplates={featureTemplates}         onToggleFeatureTemplates={handleToggleFeatureTemplates}
        featureBudgetLimits={featureBudgetLimits}   onToggleFeatureBudgetLimits={handleToggleFeatureBudgetLimits}
        featureCSVImport={featureCSVImport}         onToggleFeatureCSVImport={handleToggleFeatureCSVImport}
        featureSearchNotes={featureSearchNotes}     onToggleFeatureSearchNotes={handleToggleFeatureSearchNotes}
        featureTagFilter={featureTagFilter}         onToggleFeatureTagFilter={handleToggleFeatureTagFilter}
      />

      <PinSetupModal
        isOpen={isPinSetupOpen}
        onClose={() => setIsPinSetupOpen(false)}
        mode={pinSetupMode}
        onSuccess={handlePinSetupSuccess}
      />

      <TagsManagementModal
        isOpen={isTagsOpen}
        onClose={() => setIsTagsOpen(false)}
        allTags={allTags}
        onAdd={handleAddTag}
        onDelete={handleDeleteTag}
        onEdit={handleEditTag}
        onSync={handleSyncTags}
        activeType={activeTab !== 'balance' ? activeTab : 'income'}
      />

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

      <RecurringModal
        isOpen={isRecurringOpen}
        onClose={() => setIsRecurringOpen(false)}
        allTags={allTags}
      />

      <BudgetLimitsModal
        isOpen={isBudgetLimitsOpen}
        onClose={() => setIsBudgetLimitsOpen(false)}
        expenseTags={allTags.filter((t) => t.type === 'expense')}
        onChange={(updated) => setBudgetLimits(updated)}
      />

      <SavingsGoalsModal
        isOpen={isGoalsOpen}
        onClose={() => setIsGoalsOpen(false)}
        goals={goals}
        onAdd={handleAddGoal}
        onDelete={handleDelGoal}
      />

      <RemindersModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        reminders={reminders}
        onAdd={handleAddReminder}
        onDismiss={handleDismissReminder}
        onDelete={handleDelReminder}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        templates={templates}
        allTags={allTags}
        onAdd={handleAddTemplate}
        onDelete={handleDelTemplate}
      />

      <MonthlyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        transactions={transactions}
        filterYears={filterYears}
        filterMonths={filterMonths}
      />

      <CSVImportModal
        isOpen={isCSVOpen}
        onClose={() => setIsCSVOpen(false)}
        allTags={allTags}
        onImport={handleCSVImport}
      />

      {/* Overdue reminders toast */}
      {overdueReminders.length > 0 && !isRemindersOpen && (
        <div className="fixed bottom-24 left-4 right-4 z-40 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between">
          <p className="text-sm font-medium">
            {overdueReminders.length} overdue bill{overdueReminders.length > 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setIsRemindersOpen(true)} className="text-xs bg-white/20 px-2 py-1 rounded-lg">View</button>
            <button onClick={() => setOverdueReminders([])} className="text-xs opacity-70">✕</button>
          </div>
        </div>
      )}

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
