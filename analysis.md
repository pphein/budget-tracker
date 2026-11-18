# Budget Tracker — Project Analysis

*Prepared as interview showcase material. Reflects the codebase as of commit `4203508`.*

## 1. What it is

A mobile-first, installable PWA for tracking personal income/expenses, built with **React 19 + Create React App + Tailwind CSS**, wrapped for native mobile via **Capacitor**. It is fully client-side and offline-first — there is no backend; all data lives in the browser (localStorage or IndexedDB, user's choice).

Scope is large for a "budget tracker": beyond CRUD on transactions, it includes PIN-lock security, recurring transactions, CSV import, XLSX export, receipt photo attachments, multi-currency entry with live FX conversion, gold/oil price tracking, tax estimation across 6 countries, savings goals, bill reminders, spending-templates, and 10+ analytics widgets (forecasting, heatmaps, savings rate, income stability, cash-flow calendar). ~7,900 LOC across `src/`, ~48 components.

This is worth stating up front in an interview: the interesting engineering here isn't a single hard algorithm, it's **managing complexity and state surface area in a mid-size React app with zero backend and zero global state library** — a realistic constraint many teams actually work under.

## 2. Architecture

### State management: no Redux/Context, just React state
`src/App.js` (1,300 lines) is a single god-component holding ~50 `useState` hooks — transactions, tags, all filter state, every modal's open/closed flag, every feature-flag toggle, theme, PIN state, etc. Data flows down as props; callbacks flow up. There is **no `useContext`/`createContext` anywhere in the codebase** — `SettingsModal.js` alone destructures ~30 props, which is the clearest symptom of this choice.

This is a deliberate (if implicit) architectural point to be able to defend: for an app this size, prop drilling is honest and traceable — every data dependency is visible at the call site — at the cost of an oversized root component. The natural next step (and a good "what would you change" answer) is to carve out 2-3 `useReducer` + Context slices (e.g. `TransactionsContext`, `SettingsContext`, `SecurityContext`) rather than reaching for Redux.

### Storage: a swappable backend behind a router
`src/db.js` is a small **strategy-pattern router**: it exposes one API (`getTags`, `addTransaction`, `editTransaction`, …) and delegates every call to whichever backend the user picked in Settings — `src/storage/ls.js` (localStorage, JSON-serialized, manual incrementing IDs) or `src/storage/idb.js` (IndexedDB via the `idb` wrapper, two object stores `transactions`/`tags` with browser-native autoIncrement keys). Both backends seed the same 33 default tags (`src/storage/defaultTags.js`) and expose `syncDefaultTags()` to backfill new defaults into existing installs.

Notable gap (good to be upfront about): switching backends is a one-way manual setting — there's no migration path that copies existing data from one backend to the other, and no automatic fallback if IndexedDB is unavailable (e.g. Safari private browsing) — a call into `idb.js` in that situation just throws.

### Feature flags as UI, not config
Nine optional features (recurring transactions, split transactions, templates, budget limits, CSV import, search, tag filter, gold/exchange charts, currency converter) are toggled in Settings and persisted as plain `localStorage.setItem('featureX', 'true'/'false')` strings, read back with `=== 'true'`. This is a lightweight, self-service feature-flag system with no build step — appropriate for a single-user local app, and a good talking point on "flags without a flagging service."

## 3. Security work (see commit `bf68b4b`)

- **PIN is hashed, not stored in plaintext.** `src/utils/pin.js` generates a 16-byte salt via `crypto.getRandomValues`, then hashes `pin + salt` with `crypto.subtle.digest('SHA-256', …)` (Web Crypto API) — the only use of Web Crypto in the project.
- **Brute-force lockout**: 5 free attempts, then escalating lockout windows `[30s, 60s, 2m, 5m, 15m]` indexed by attempt count, stored as an absolute `pinLockoutUntil` timestamp with a live countdown in `PinScreen.js`.
- **Auto-lock on inactivity**: `recordActivity()` stamps `lastActive` on every user interaction and `document.visibilitychange`; `shouldLockNow()` compares elapsed time against a user-configurable timeout.
- **Honest limitation to name yourself before an interviewer finds it**: the PIN gates *UI access* only — it does not encrypt the underlying transaction data at rest. A single SHA-256 pass (no PBKDF2/bcrypt/scrypt) is fine for a locally-brute-forced 4-6 digit PIN gate, but framing it as "encryption" would be wrong; it's authentication, not confidentiality.
- **Formula-injection protection on XLSX export**: cell values starting with `=+-@|` are sanitized before being written to spreadsheets (`RecordList.js`), preventing a classic CSV/Excel injection vector where a malicious "tag" or "note" string becomes a formula that executes when the exported file is opened.
- **Image-type validation before FileReader processing** on receipt attachments, closing off a class of malformed-file issues.
- **Asymmetry worth knowing**: CSV *import* has no equivalent sanitization of the export-side formula guard — imported note/tag text isn't checked before being stored (it would only become dangerous again if re-exported, at which point the export sanitizer does catch it).

## 4. Performance work (same commit)

- **Bundle splitting**: `xlsx` + `file-saver` (a combined ~500KB+) are loaded via dynamic `import()` only when the user actually exports, not on initial load — done in both `RecordList.js` and `App.js` (currently duplicated rather than extracted to a shared util — a good simplification to mention).
- **Memoization**: `useMemo` for sorted records, z-score anomaly detection, and tag-color maps in `RecordList.js`; `Intl.NumberFormat` instances hoisted to module scope as singletons (formatter construction is comparatively expensive and was previously re-created per render/row).
- **`React.memo`** on `RecordList`, `SummaryCards`, `BudgetProgress` — worth being honest that this is only partially effective: `App.js` passes `handleEditTransaction`, `handleDeleteTransaction`, and `formatDateTime` as fresh closures every render (no `useCallback`), which defeats `React.memo`'s shallow prop comparison on `RecordList`. This is a real, spottable bug — good to know it *and* know the one-line fix (wrap those three in `useCallback`).
- Coverage is uneven: `TagTrendChart.js` does an equivalent per-render reduce over the full transaction array without `useMemo`, unlike its sibling analytics widgets — an easy follow-up item.

## 5. Data visualization

Seven components built on **Recharts** (`ResponsiveContainer` throughout): `BalanceChart` (`ComposedChart`, dual bars + a 3-period rolling-average net line), `SpendingPieChart`, `TagTrendChart` (`LineChart`), `GoldPriceChart`/`ExchangeRateChart`/`OilPriceChart` (`LineChart`, each independently fetching and caching external price data), and `MonthlyReportModal` (combines `BarChart` + `LineChart` in one report view). Two more analytics widgets are hand-rolled rather than chart-library-based: `CashFlowCalendar` (custom month grid, green/red day cells) and `TagExpenseHeatmap` (tag × month grid with alpha-blended intensity) — a sensible choice, since neither is a "chart" in the axis/series sense Recharts is built for.

## 6. Domain logic worth highlighting

- **Recurring transactions** (`utils/recurring.js`): `processDueRecurring()` correctly *catches up* — if the app wasn't opened for 3 months, it back-fills 3 monthly transactions in a loop rather than just 1, advancing `nextDate` each iteration. Dates are anchored to noon (`T12:00:00`) specifically to dodge timezone-driven day rollover — a small detail that shows awareness of a classic date-math bug class.
- **Progressive tax calculator** (`utils/taxCalculator.js`): static bracket tables for 6 countries (MM/SG/TH/US/GB/AU), computing per-bracket tax via `min(income, bracketMax ?? Infinity) - bracketMin`, returning both total tax and a bracket-by-bracket breakdown.
- **Multi-currency entry**: transactions are always stored normalized to MMK (`storedAmount = enteredAmt * mmkRate / txCurrencyRate`), with `origAmount`/`currency` retained for display — a sound "store in one canonical unit, keep the original for UI" pattern.
- **CSV import** (`CSVImportModal.js`): a hand-rolled character-by-character CSV parser (quote-aware, but not RFC 4180-complete — doesn't handle escaped `""` or newlines inside quoted fields). Validates amounts (`replace(/[^0-9.-]/g,'')` + `parseFloat`, drops rows ≤ 0 or NaN) and whitelists `type` to `income|expense`; unmatched tag names silently fall back to a default tag rather than erroring or creating a new one — a lossy-but-safe default worth being able to defend or improve.

## 7. PWA / offline / mobile

Standard CRA service worker (Workbox `precaching`/`routing`/`strategies`) plus a `manifest.json` (standalone display, themed). `beforeinstallprompt` is captured in `App.js` to drive a custom "Install" button rather than relying on the browser's default banner. Capacitor (`@capacitor/android`, `@capacitor/core`, `@capacitor/cli`) wraps the same web build for a native Android shell — same codebase, two distribution channels.

## 8. Honest gaps (own these before an interviewer finds them)

- **Testing is effectively absent.** The only test file is the untouched CRA boilerplate (`App.test.js`), which asserts on a "learn react" link that doesn't exist in this app — it would fail if run. This is the single most legitimate criticism of the project and worth having a real answer for (see QnA.md).
- **ID generation is inconsistent across modules**: incrementing counter in `ls.js`/`db.js`/`recurring.js`, IndexedDB `autoIncrement` in `idb.js`, and `Date.now()` in `templates.js`/`goals.js`/`reminders.js`. None are collision-proof under concurrent/rapid writes; `crypto.randomUUID()` would unify this.
- **Modal architecture is inconsistent**: `@headlessui/react`'s `Dialog` (with built-in focus trap and `Escape`-to-close) is used in exactly one place (`DeleteConfirmModal.js`); roughly ten other modals are hand-rolled `fixed inset-0` overlays with no focus trap and no keyboard dismissal.
- **Accessibility is thin** overall — one `aria-label` in the entire component layer, one `role="button"` on a `<span>` that should be a `<button>`.
- **No data-at-rest encryption**; PIN is an access gate, not a confidentiality mechanism, given everything is local-only, in-browser plaintext JSON.

## 9. How to talk about this project in an interview

Lead with: *"This started as a simple two-tab tracker and grew into a full personal-finance app with zero backend — the interesting problems were all about managing state and complexity growth in plain React, not needing a framework to do it."* Then be ready to go deep in whichever direction the interviewer steers: state-management tradeoffs, the PIN/security work, the performance pass, or the honest gaps above. The gaps are not weaknesses to hide — volunteering them with a fix in mind is a stronger signal of seniority than pretending the code is flawless.
