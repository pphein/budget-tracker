import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  SunIcon,
  MoonIcon,
  TagIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  TrashIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { COLOR_THEMES } from '../utils/colorTheme';
import { getGoldApiKey, saveGoldApiKey, fetchWorldGoldPrice } from '../utils/goldPrice';
import { isPinEnabled, getLockTimeout, setLockTimeout, disablePin } from '../utils/pin';
import { isWebAuthnSupported, isBiometricEnabled, registerBiometric, disableBiometric } from '../utils/webauthn';
import { useLanguage, LANGUAGES } from '../i18n/LanguageContext';
import { TAX_COUNTRIES } from '../utils/taxCalculator';
import { STORAGE_OPTIONS, getStorageType, setStorageType } from '../db';

const LOCK_OPTIONS = [
  { label: '1 min',  value: 1  },
  { label: '5 min',  value: 5  },
  { label: '15 min', value: 15 },
  { label: 'Never',  value: 0  },
];

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={() => onToggle(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      enabled ? 'bg-[var(--primary-500)]' : 'bg-gray-300 dark:bg-gray-600'
    }`}
  >
    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
      enabled ? 'translate-x-6' : 'translate-x-1'
    }`} />
  </button>
);

const SettingsModal = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  colorTheme,
  onColorThemeChange,
  onManageTags,
  installPrompt,
  onInstall,
  goldPrices,
  onSaveGoldPrices,
  showGoldBar,
  onToggleGoldBar,
  showExchangeBar,
  onToggleExchangeBar,
  showGoldChart,
  onToggleGoldChart,
  showExchangeChart,
  onToggleExchangeChart,
  showOilChart,
  onToggleOilChart,
  showCurrencyConverter,
  onToggleCurrencyConverter,
  showHealthScore,
  onToggleHealthScore,
  taxSettings,
  onTaxSettingsChange,
  onSetupPin,
  onChangePin,
  onStorageChange,
  onBackup,
  onRestore,
  onOpenTrash,
  trashCount,
  onOpenQrShare,
  onOpenQrImport,
  // Feature add-ons
  featureRecurring,     onToggleFeatureRecurring,
  featureSplit,         onToggleFeatureSplit,
  featureTemplates,     onToggleFeatureTemplates,
  featureBudgetLimits,  onToggleFeatureBudgetLimits,
  featureCSVImport,     onToggleFeatureCSVImport,
  featureSearchNotes,   onToggleFeatureSearchNotes,
  featureTagFilter,     onToggleFeatureTagFilter,
  featureAccounts,      onToggleFeatureAccounts,
  onManageAccounts,
  featureDebtTracker,   onToggleFeatureDebtTracker,
  featureNetWorth,      onToggleFeatureNetWorth,
  featureQuickAdd,      onToggleFeatureQuickAdd,
}) => {
  const { t, lang, setLang } = useLanguage();
  const [pinEnabled,   setPinEnabled]   = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricError, setBiometricError]     = useState('');
  const [lockTimeout,  setLockTimeoutV] = useState(5);
  const [storageType,  setStorageTypeV] = useState(() => getStorageType());
  const [worldInput, setWorldInput]     = useState('');
  const [myanmarInput, setMyanmarInput] = useState('');
  const [goldSaved, setGoldSaved]       = useState(false);

  const [apiKey, setApiKey]             = useState('');
  const [showApiKey, setShowApiKey]     = useState(false);
  const [fetching, setFetching]         = useState(false);
  const [fetchError, setFetchError]     = useState('');

  useEffect(() => {
    if (isOpen) {
      setWorldInput(goldPrices?.worldPrice ?? '');
      setMyanmarInput(goldPrices?.myanmarPrice ?? '');
      setGoldSaved(false);
      setFetchError('');
      setApiKey(getGoldApiKey());
      setPinEnabled(isPinEnabled());
      setBiometricEnabled(isBiometricEnabled());
      setBiometricError('');
      setLockTimeoutV(getLockTimeout());
      setStorageTypeV(getStorageType());
    }
  }, [isOpen, goldPrices]);

  const handleTogglePin = () => {
    if (pinEnabled) {
      disablePin();
      setPinEnabled(false);
      disableBiometric();
      setBiometricEnabled(false);
    } else {
      onClose();
      onSetupPin();
    }
  };

  const handleToggleBiometric = async () => {
    if (biometricEnabled) {
      disableBiometric();
      setBiometricEnabled(false);
      return;
    }
    setBiometricError('');
    try {
      await registerBiometric();
      setBiometricEnabled(true);
    } catch (err) {
      setBiometricError(err.message || 'Could not register biometric unlock on this device');
    }
  };

  const handleLockTimeout = (val) => {
    setLockTimeoutV(val);
    setLockTimeout(val);
  };

  const handleStorageChange = (val) => {
    setStorageTypeV(val);
    setStorageType(val);
    onStorageChange?.();
  };

  const handleSaveGold = () => {
    if (apiKey.trim()) saveGoldApiKey(apiKey.trim());
    onSaveGoldPrices({
      worldPrice:   worldInput   ? parseFloat(worldInput)   : null,
      myanmarPrice: myanmarInput ? parseFloat(myanmarInput) : null,
    });
    setGoldSaved(true);
    setTimeout(() => setGoldSaved(false), 2000);
  };

  const handleFetchLive = async () => {
    const key = apiKey.trim();
    if (!key) { setFetchError('Enter your goldapi.io API key first'); return; }
    setFetching(true);
    setFetchError('');
    try {
      const price = await fetchWorldGoldPrice(key);
      saveGoldApiKey(key);
      setWorldInput(price);
      // auto-save immediately with new world price
      onSaveGoldPrices({
        worldPrice: price,
        myanmarPrice: myanmarInput ? parseFloat(myanmarInput) : null,
      });
      setGoldSaved(true);
      setTimeout(() => setGoldSaved(false), 2000);
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch price');
    } finally {
      setFetching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('settings.title')}</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── APPEARANCE ── */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
            {t('settings.appearance')}
          </h3>

          {/* Dark mode row */}
          <div className="flex items-center justify-between py-1 mb-5">
            <div className="flex items-center gap-3">
              {theme === 'dark'
                ? <MoonIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                : <SunIcon  className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
              </span>
            </div>
            <button
              onClick={onToggleTheme}
              aria-label="Toggle dark mode"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                theme === 'dark' ? 'bg-[var(--primary-500)]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Accent color */}
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">{t('settings.accentColor')}</p>
          <div className="grid grid-cols-4 gap-3">
            {COLOR_THEMES.map((t) => {
              const active = colorTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onColorThemeChange(t.id)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
                    active
                      ? 'border-gray-800 dark:border-white scale-105'
                      : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-full shadow-sm flex items-center justify-center"
                    style={{ backgroundColor: t.colors[500] }}
                  >
                    {active && <CheckIcon className="w-4 h-4 text-white" />}
                  </span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Language */}
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3 mt-5">{t('settings.language')}</p>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((l) => {
              const active = lang === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  className={`flex items-center justify-center py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    active
                      ? 'border-[var(--primary-500)] text-[var(--primary-600)] dark:text-[var(--primary-400)]'
                      : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── GOLD PRICE ── */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Gold Price
            </h3>
            <Toggle enabled={showGoldBar} onToggle={onToggleGoldBar} />
          </div>

          <div className="space-y-3">
            {/* World gold */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                World Gold (USD / oz)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  value={worldInput}
                  onChange={(e) => { setWorldInput(e.target.value); setFetchError(''); }}
                  placeholder="e.g. 2350"
                  className="flex-1 min-w-0 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <button
                  onClick={handleFetchLive}
                  disabled={fetching}
                  title="Fetch live price from goldapi.io"
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 disabled:opacity-50 text-white text-xs font-medium flex-shrink-0 transition-colors"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
                  {fetching ? 'Fetching…' : 'Live'}
                </button>
              </div>
            </div>

            {/* goldapi.io API key */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                goldapi.io API Key
                <a
                  href="https://www.goldapi.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-[var(--primary-500)] hover:underline"
                >
                  (free — 100 req/month)
                </a>
              </label>
              <div className="flex gap-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setFetchError(''); }}
                  placeholder="goldapi-xxxxxxxxxxxx-io"
                  className="flex-1 min-w-0 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 font-mono"
                />
                <button
                  onClick={() => setShowApiKey((v) => !v)}
                  className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  title={showApiKey ? 'Hide key' : 'Show key'}
                >
                  {showApiKey
                    ? <EyeSlashIcon className="w-4 h-4" />
                    : <EyeIcon      className="w-4 h-4" />}
                </button>
              </div>
              {fetchError && (
                <p className="mt-1.5 text-xs text-red-500">{fetchError}</p>
              )}
            </div>

            {/* Myanmar gold */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Myanmar Gold (MMK / ကျပ်)
                <span className="ml-2 text-gray-400 font-normal">manual</span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={myanmarInput}
                onChange={(e) => setMyanmarInput(e.target.value)}
                placeholder="e.g. 560000"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {goldPrices?.updatedAt
                  ? `Updated: ${new Date(goldPrices.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : 'Not set yet'}
              </span>
              <button
                onClick={handleSaveGold}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  goldSaved
                    ? 'bg-green-500 text-white'
                    : 'bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white'
                }`}
              >
                {goldSaved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* ── EXCHANGE RATE ── */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Exchange Rate
            </h3>
            <Toggle enabled={showExchangeBar} onToggle={onToggleExchangeBar} />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Shows live USD rates (SGD, THB, EUR, JPY…) on the home screen. Refreshes every hour.
          </p>
        </div>

        {/* ── ADD-ONS ── */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
            {t('settings.addons')}
          </h3>

          {/* Gold price chart */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Gold Price Chart</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Monthly trend chart (requires goldapi.io key)</p>
            </div>
            <Toggle enabled={showGoldChart} onToggle={onToggleGoldChart} />
          </div>

          {/* Exchange rate chart */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Dollar Rate Chart</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Monthly USD rate trend (SGD, THB, EUR…)</p>
            </div>
            <Toggle enabled={showExchangeChart} onToggle={onToggleExchangeChart} />
          </div>

          {/* Oil price chart */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">🛢️ Oil Price Chart</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">WTI & Brent monthly trend — no API key needed</p>
            </div>
            <Toggle enabled={showOilChart} onToggle={onToggleOilChart} />
          </div>

          {/* Currency converter */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Currency Converter</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Quick converter using live exchange rates</p>
            </div>
            <Toggle enabled={showCurrencyConverter} onToggle={onToggleCurrencyConverter} />
          </div>

          {/* Financial health score */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.healthScore')}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Combined savings rate, stability &amp; budget grade</p>
            </div>
            <Toggle enabled={showHealthScore} onToggle={onToggleHealthScore} />
          </div>

          {/* Search notes */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Search Notes</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Search bar to filter records by tag or note</p>
            </div>
            <Toggle enabled={featureSearchNotes} onToggle={onToggleFeatureSearchNotes} />
          </div>

          {/* Tag filter */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Tag Filter</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Multi-select tag filter on income/expense list</p>
            </div>
            <Toggle enabled={featureTagFilter} onToggle={onToggleFeatureTagFilter} />
          </div>

          {/* Accounts / wallets */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.accounts')}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Track balances across Cash, Bank, etc.</p>
            </div>
            <Toggle enabled={featureAccounts} onToggle={onToggleFeatureAccounts} />
          </div>
          {featureAccounts && (
            <button
              onClick={() => { onClose(); onManageAccounts(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-4"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.manageAccounts')}</span>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {/* Debt / loan tracker */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.debtTracker')}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Track loan/debt payoff progress</p>
            </div>
            <Toggle enabled={featureDebtTracker} onToggle={onToggleFeatureDebtTracker} />
          </div>

          {/* Net worth */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.netWorth')}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Combine accounts, assets &amp; debts into one total</p>
            </div>
            <Toggle enabled={featureNetWorth} onToggle={onToggleFeatureNetWorth} />
          </div>

          {/* Quick add */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.quickAdd')}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Type e.g. "coffee 3000" to fill amount &amp; tag</p>
            </div>
            <Toggle enabled={featureQuickAdd} onToggle={onToggleFeatureQuickAdd} />
          </div>

          {/* Recurring transactions */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Recurring Transactions</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Auto-create scheduled income/expenses</p>
            </div>
            <Toggle enabled={featureRecurring} onToggle={onToggleFeatureRecurring} />
          </div>

          {/* Split transaction */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Split Transaction</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Divide one payment across multiple tags</p>
            </div>
            <Toggle enabled={featureSplit} onToggle={onToggleFeatureSplit} />
          </div>

          {/* Templates */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Quick Templates</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Save preset entries for one-tap add</p>
            </div>
            <Toggle enabled={featureTemplates} onToggle={onToggleFeatureTemplates} />
          </div>

          {/* Budget Limits */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Budget Limits</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Set monthly spending caps per tag</p>
            </div>
            <Toggle enabled={featureBudgetLimits} onToggle={onToggleFeatureBudgetLimits} />
          </div>

          {/* CSV Import */}
          <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">CSV Import</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Bulk import transactions from a CSV file</p>
            </div>
            <Toggle enabled={featureCSVImport} onToggle={onToggleFeatureCSVImport} />
          </div>

          {/* Tax calculator */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Income Tax Calculator</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Shows monthly tax estimate on home screen</p>
              </div>
              <Toggle
                enabled={taxSettings?.enabled}
                onToggle={(val) => onTaxSettingsChange({ ...taxSettings, enabled: val })}
              />
            </div>

            {/* Country picker — shown only when enabled */}
            {taxSettings?.enabled && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Tax Country</p>
                <div className="grid grid-cols-3 gap-2">
                  {TAX_COUNTRIES.map((c) => {
                    const active = taxSettings.country === c.code;
                    return (
                      <button
                        key={c.code}
                        onClick={() => onTaxSettingsChange({ ...taxSettings, country: c.code })}
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all text-xs font-medium ${
                          active
                            ? 'border-[var(--primary-500)] bg-[var(--primary-50)] dark:bg-[var(--primary-900)]/30 text-[var(--primary-600)] dark:text-[var(--primary-400)]'
                            : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <span className="text-lg">{c.flag}</span>
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SECURITY ── */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
            {t('settings.security')}
          </h3>

          {/* PIN toggle */}
          <div className="flex items-center justify-between py-1 mb-3">
            <div className="flex items-center gap-3">
              <LockClosedIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.pinLock')}</span>
            </div>
            <button
              onClick={handleTogglePin}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                pinEnabled ? 'bg-[var(--primary-500)]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                pinEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Change PIN + Auto-lock (visible only when PIN enabled) */}
          {pinEnabled && (
            <>
              <button
                onClick={() => { onClose(); onChangePin(); }}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-3"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.changePin')}</span>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </button>

              {/* Biometric unlock (requires PIN as fallback) */}
              {isWebAuthnSupported() && (
                <div className="mb-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.biometricUnlock')}</span>
                    <button
                      onClick={handleToggleBiometric}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        biometricEnabled ? 'bg-[var(--primary-500)]' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  {biometricError && (
                    <p className="text-xs text-red-500 mt-1">{biometricError}</p>
                  )}
                </div>
              )}

              {/* Auto-lock timeout */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t('settings.autoLockAfter')}</p>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  {LOCK_OPTIONS.map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => handleLockTimeout(value)}
                      className={`flex-1 py-2 text-xs font-medium transition-colors ${
                        lockTimeout === value
                          ? 'bg-[var(--primary-500)] text-white'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── DATA ── */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
            {t('settings.data')}
          </h3>

          {/* Storage type */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t('settings.storage')}</p>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {STORAGE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleStorageChange(value)}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                    storageType === value
                      ? 'bg-[var(--primary-500)] text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              {storageType === 'localStorage'
                ? 'Stored in browser localStorage — simple and reliable.'
                : 'Stored in IndexedDB — larger capacity, same device.'}
            </p>
          </div>

          <button
            onClick={() => { onClose(); onManageTags(); }}
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TagIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.manageTags')}</span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => { onClose(); onBackup(); }}
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-2"
          >
            <div className="flex items-center gap-3">
              <ArrowDownTrayIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.backupData')}</span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => { onClose(); onRestore(); }}
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-2"
          >
            <div className="flex items-center gap-3">
              <ArrowUpTrayIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.restoreBackup')}</span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => { onClose(); onOpenTrash(); }}
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-2"
          >
            <div className="flex items-center gap-3">
              <TrashIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('settings.trash')}{trashCount > 0 ? ` (${trashCount})` : ''}
              </span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => { onClose(); onOpenQrShare(); }}
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-2"
          >
            <div className="flex items-center gap-3">
              <QrCodeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.shareSetup')}</span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => { onClose(); onOpenQrImport(); }}
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-2"
          >
            <div className="flex items-center gap-3">
              <QrCodeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.importSetup')}</span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* ── INSTALL ── */}
        {installPrompt && (
          <div className="px-4 pt-5 pb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
              App
            </h3>
            <button
              onClick={onInstall}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Install App</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
