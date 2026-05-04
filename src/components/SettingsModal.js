import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  SunIcon,
  MoonIcon,
  TagIcon,
  ArrowDownTrayIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { COLOR_THEMES } from '../utils/colorTheme';

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
}) => {
  const [worldInput, setWorldInput]     = useState('');
  const [myanmarInput, setMyanmarInput] = useState('');
  const [goldSaved, setGoldSaved]       = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWorldInput(goldPrices?.worldPrice ?? '');
      setMyanmarInput(goldPrices?.myanmarPrice ?? '');
      setGoldSaved(false);
    }
  }, [isOpen, goldPrices]);

  const handleSaveGold = () => {
    onSaveGoldPrices({
      worldPrice:   worldInput   ? parseFloat(worldInput)   : null,
      myanmarPrice: myanmarInput ? parseFloat(myanmarInput) : null,
    });
    setGoldSaved(true);
    setTimeout(() => setGoldSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Settings</h2>
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
            Appearance
          </h3>

          {/* Dark mode row */}
          <div className="flex items-center justify-between py-1 mb-5">
            <div className="flex items-center gap-3">
              {theme === 'dark'
                ? <MoonIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                : <SunIcon  className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
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
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Accent Color</p>
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
        </div>

        {/* ── GOLD PRICE ── */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
            Gold Price
          </h3>

          <div className="space-y-3">
            {/* World gold */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                World Gold (USD / oz)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={worldInput}
                onChange={(e) => setWorldInput(e.target.value)}
                placeholder="e.g. 2350"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* Myanmar gold */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Myanmar Gold (MMK / ကျပ်)
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

        {/* ── DATA ── */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
            Data
          </h3>
          <button
            onClick={() => { onClose(); onManageTags(); }}
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TagIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Manage Tags</span>
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
