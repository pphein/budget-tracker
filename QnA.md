# Budget Tracker — Interview Q&A Prep

*Companion to analysis.md. Answers are written the way you should say them out loud — concrete, specific to this codebase, and honest about tradeoffs.*

---

## Architecture & State Management

**Q: Walk me through the high-level architecture.**
A: It's a client-only React 19 PWA — no backend, no API layer. `App.js` is the root component and owns essentially all application state (transactions, tags, filters, every modal's open state, feature flags). Data persistence goes through `db.js`, a thin router that delegates to one of two interchangeable backends — `storage/ls.js` (localStorage) or `storage/idb.js` (IndexedDB) — chosen at runtime in Settings. Everything else — 48 components — is presentational or semi-presentational, receiving data and callbacks as props.

**Q: Why no Redux, Zustand, or Context API?**
A: For a single-user, backend-less app of this size, prop drilling is more honest than it sounds — every data dependency is visible at the call site, there's no action-type indirection to trace through, and there's exactly one component tree, not multiple islands that need shared state. The cost is that `App.js` is 1,300 lines and `SettingsModal` takes ~30 props. If I were to change one thing architecturally, it'd be splitting state into 2-3 `useReducer` + Context slices (transactions, settings/feature-flags, security/PIN) — not because prop drilling is "wrong," but because the app outgrew a single flat state object once it crossed ~30 pieces of state.

**Q: How would you refactor `App.js` if you had a week?**
A: Three moves, in order of value: (1) extract state + handlers into custom hooks per domain — `useTransactions()`, `useFeatureFlags()`, `usePinLock()` — which shrinks `App.js` to mostly JSX without changing behavior; (2) promote 2 of those hooks' state into Context so components like `SettingsModal` stop needing 30 props; (3) extract a shared `Modal`/`BottomSheet` primitive, since ~10 components currently hand-roll the same `fixed inset-0` overlay pattern. I'd do it in that order because it's the one that's safest to land incrementally without a UI regression.

**Q: Is there prop drilling? Is that a problem?**
A: Yes, and yes for `SettingsModal` specifically (~30 props) and no for most other components (2-6 props, which is fine). Prop drilling becomes a real problem when a value has to pass through 3+ intermediate components that don't use it themselves — that's not really happening here since `App.js` is the direct parent of nearly everything. The pain is prop *count* at the leaves, not prop *depth* through the tree, which is why Context (not a state library) is the right-sized fix.

---

## Performance

**Q: What performance work have you done, concretely?**
A: Four things, from a dedicated pass (commit `bf68b4b`): (1) dynamic `import()` for `xlsx`+`file-saver` so ~500KB only loads when a user actually exports; (2) `useMemo` around the expensive derived data in `RecordList` — sorting, a z-score anomaly-detection pass, and tag-color lookups; (3) hoisting `Intl.NumberFormat` instances to module scope as singletons instead of constructing one per row/render; (4) `React.memo` on `RecordList`, `SummaryCards`, `BudgetProgress`.

**Q: Does `React.memo` on `RecordList` actually work?**
A: Partially — and I'd rather say that than oversell it. `App.js` passes `handleEditTransaction`, `handleDeleteTransaction`, and `formatDateTime` into `RecordList` as plain function declarations, recreated every render. `React.memo`'s shallow-compare sees new function references every time, so the memo doesn't skip re-renders on those changes — the win it does provide is on the *data-shape* props (the `useMemo`'d sorted records array is referentially stable across renders that don't touch transactions). The fix is wrapping those three handlers in `useCallback` with the right dependency arrays.

**Q: If profiling showed `RecordList` re-rendering too often, what would you check first?**
A: React DevTools Profiler with "highlight updates" on, to confirm it's actually the handler-identity issue rather than something else (e.g. a parent state update unrelated to the list). Then I'd check whether `filteredRecords` itself (built fresh every render in `App.js` via `.filter()`) is a new array reference each time — even with stable callbacks, a new array prop still fails shallow-compare, so that'd need its own `useMemo` keyed on `transactions`/`activeTab`/`selectedTags`/filters.

**Q: Any component doing something expensive without memoization?**
A: `TagTrendChart.js` re-filters/reduces the full transaction array on every render, unlike its sibling analytics widgets (`TopSpendingTags`, `BudgetForecast`, `MonthComparison`, etc.) which all wrap that work in `useMemo`. It's a straightforward, low-risk fix — the fact that it's inconsistent across near-identical components is itself worth flagging as a code-review finding.

**Q: How do you avoid loading heavy libraries on initial page load?**
A: Dynamic `import()` at the call site, gated behind the action that actually needs the library — `const [XLSX, { saveAs }] = await Promise.all([import('xlsx'), import('file-saver')])` right inside the export handler. It's currently duplicated between `App.js` and `RecordList.js`; extracting it into a shared `exportXlsx(rows, filename)` util would remove the duplication without changing the lazy-loading behavior.

---

## Security

**Q: How is the PIN stored? Is it plaintext?**
A: Not plaintext. `utils/pin.js` generates a random 16-byte salt via `crypto.getRandomValues`, then computes `SHA-256(pin + salt)` via `crypto.subtle.digest` (Web Crypto API), storing only the salt and the resulting hash in localStorage. Verifying a PIN recomputes the hash with the stored salt and compares.

**Q: Isn't a single SHA-256 pass weak compared to bcrypt/PBKDF2?**
A: In the abstract, yes — SHA-256 is fast, which is exactly what you don't want for password hashing, because it makes offline brute force cheap. In this specific context I'd push back gently: the input space is a short numeric PIN (4-6 digits) gating local UI access to data that's already sitting unencrypted in the same browser storage the hash lives in. A slow KDF adds real defense if an attacker exfiltrates the hash and brute-forces it offline, but doesn't change the fact that the underlying transaction data itself isn't encrypted — so the honest framing is "this stops casual/shoulder-surfing access to the UI," not "this is cryptographic protection of financial data." If I were asked to actually harden it, PBKDF2/scrypt via Web Crypto is a small, drop-in change to `hashPin()`.

**Q: What stops PIN brute-forcing?**
A: An escalating lockout: 5 free attempts, then lockout windows of `[30s, 60s, 2m, 5m, 15m]` indexed by how many failures beyond the free allowance have occurred, capping at 15 minutes. It's stored as an absolute `pinLockoutUntil` timestamp (not a countdown that resets on reload), and `PinScreen.js` shows a live countdown plus "N attempts remaining" messaging.

**Q: What other security work is in here?**
A: Formula-injection protection on XLSX export — any cell value starting with `= + - @ |` gets sanitized before being written, because those prefixes let Excel interpret a string as a formula (a real, historically-exploited vector when apps export user-controlled text like tags/notes to spreadsheets opened by someone else). Also image-type validation before a `FileReader` processes an uploaded receipt photo.

**Q: Is there a gap between import and export sanitization?**
A: Yes, and it's worth naming proactively: `CSVImportModal.js` doesn't apply the same `=+-@|` sanitization on the way in that `RecordList.js` applies on the way out. It's low severity in practice — the export-side sanitizer still catches it if that data is later re-exported — but the asymmetry is a legitimate code-review finding, and the fix is trivial (reuse the same sanitizer function on import).

**Q: What's the biggest security limitation of the app as a whole?**
A: No encryption at rest. The PIN is an authentication gate on the UI, but the actual transaction data is unencrypted JSON in localStorage/IndexedDB. Anyone with filesystem access to the device (not just app access) can read it directly. That's an acceptable tradeoff for a personal offline tracker, but I wouldn't want to describe the PIN feature as "securing the data" — it secures the *screen*.

---

## Data Persistence / Storage Strategy

**Q: Why two storage backends instead of just picking one?**
A: `localStorage` is simpler (synchronous, works everywhere, trivial to debug) but capped around 5-10MB and string-only. `IndexedDB` scales to much larger datasets and stores structured data natively, at the cost of an async API. Rather than commit to one, `db.js` implements both behind a single interface — a small strategy pattern — so the choice is a runtime user setting, not a compile-time decision. It also meant I could ship the simpler backend first and add IndexedDB later without touching any calling code.

**Q: What happens if a user switches storage backends? Does data move with them?**
A: No — and that's a real gap I'd flag before anyone else does. Switching in Settings just changes which backend future reads/writes hit; there's no migration step that copies existing records across. The fix is a straightforward `migrate()` function: read everything from the old backend, write it to the new one, then flip the setting — I'd want to build that before recommending backend-switching to a real user.

**Q: What happens if IndexedDB fails to open (e.g. Safari private browsing)?**
A: Right now, nothing gracefully — the call throws and there's no automatic fallback to localStorage. Given the storage router architecture already exists, adding a fallback is cheap: wrap `getDB()` in a try/catch that flips `storageType` back to `localStorage` and surfaces a toast, rather than leaving the user with a broken write.

**Q: How are IDs generated, and is that consistent?**
A: No, and this is one of the more interesting "spot the inconsistency" findings in the codebase: `ls.js`/`db.js`/`recurring.js` use an incrementing `max(existing) + 1` counter, `idb.js` relies on IndexedDB's native `autoIncrement` keys, and `templates.js`/`goals.js`/`reminders.js` use `Date.now()`. None of the three are collision-proof under concurrency (e.g. two tabs, or a bulk-add loop firing within the same millisecond for the `Date.now()` case). `crypto.randomUUID()` would unify all of them with negligible cost.

**Q: How does seeding/default data work?**
A: `storage/defaultTags.js` holds 33 static seed tags. Both backends call `ensureSeeded()` on first read to bulk-insert them if the tag store is empty, and expose `syncDefaultTags()` — a diff-by-lowercase-name operation — so that if the app ships new default tags in a later version, existing installs can backfill just the new ones without duplicating what's already there.

---

## React Patterns & Component Design

**Q: Any custom hooks in the codebase?**
A: None — every component inlines its own state and effects, including near-duplicated data-fetching logic across `GoldPriceChart`, `ExchangeRateChart`, and `OilPriceChart` (each independently manages loading/fetch/cache state for a very similar "fetch external price series, cache with a TTL, render a LineChart" shape). That's a clear extraction candidate — a `usePriceSeries(fetcher, cacheKey, ttl)` hook would remove three parallel implementations of the same pattern.

**Q: Where does the codebase use `forwardRef`, and why?**
A: `DateBtn` in `App.js` and `EditTransactionModal.js` wraps `react-datepicker`'s `customInput` prop, which requires the custom input component to forward a ref so the date-picker library can manage focus/positioning on the actual DOM button. It's defined outside the component body specifically to keep a stable reference across renders (a comment in the code calls this out directly).

**Q: Any direct DOM manipulation, and is it a smell?**
A: One deliberate case: `compressImage()` (used for receipt photo attachments) creates an off-React `<canvas>` element, draws the loaded image onto it at a capped 400px dimension, and reads back a compressed JPEG data URL — entirely outside React's render cycle. That's appropriate, not a smell: canvas pixel manipulation has no meaningful React representation, and the imperative code is fully contained in a standalone function that returns a Promise, not spread across component lifecycle methods.

**Q: What accessibility gaps would you flag in a code review?**
A: The component layer has exactly one `aria-label` in ~5,700 lines (the dark-mode toggle in `SettingsModal`), one instance of `role="button"` on a `<span>` that should just be a `<button>` (`Filter.js`), and only one modal (`DeleteConfirmModal`, via `@headlessui/react`'s `Dialog`) with a real focus trap and `Escape`-to-close — the other ~10 modal-like components are hand-rolled overlays with none of that. Given `@headlessui/react` is already a dependency and already used correctly once, the fix isn't "add a new library," it's "adopt the one you already have everywhere else."

**Q: Why is `@headlessui/react`'s `Dialog` used in only one place?**
A: Best honest answer: incremental development — most modals were built before or without reaching for the Dialog primitive, and it was never retrofitted. It's a good example of technical debt that's cheap to point at and describe the fix for (extract a shared `<Modal>` wrapping `Dialog`, migrate call sites one at a time) rather than something structurally hard to fix.

---

## Testing & Quality

**Q: What's your test coverage like?**
A: Honestly, effectively zero — the only test file is the default Create React App boilerplate (`App.test.js`), and it asserts on a "learn react" link that doesn't even exist in this app anymore, so it would fail if it ran. I'd rather say that plainly than have it discovered.

**Q: So how did you catch bugs / verify features worked?**
A: Manual testing in-browser during development, plus the kind of self-review that produced the `idea.md` document in the repo — a running list of known bugs and upgrade ideas I kept as I found issues (e.g. a hardcoded timezone offset hack, dead filter state in `RecordList`, an unsorted balance table). That's a reasonable substitute for solo, fast-moving feature work, but it doesn't scale, and it's not something I'd defend as sufficient for anything beyond a personal project.

**Q: If you had to add tests starting tomorrow, where would you start?**
A: Bottom-up, by risk: (1) pure utils first, since they're the highest-leverage, easiest-to-test code — `taxCalculator.js` (bracket math is easy to get subtly wrong at boundaries), `recurring.js`'s `processDueRecurring`/`advanceDate` (the catch-up-loop logic is exactly the kind of thing that silently breaks on an edge case like month-end dates or DST), and `pin.js` (lockout escalation logic). (2) Then the storage layer — `ls.js` and `idb.js` against the same shared test suite, since they're meant to be interchangeable and a shared spec would catch behavioral drift between them. (3) Only then component tests, starting with `RecordList` and the transaction-add flow in `App.js`, using React Testing Library the way the project's existing dependencies (`@testing-library/react`, `@testing-library/user-event`) already anticipate.

**Q: Why prioritize utils over components?**
A: Utils are pure functions with no rendering, no async timing flakiness, and the highest bug density per line for this kind of app — date math and tax brackets are exactly where off-by-one and boundary errors hide. They're also where a regression is most expensive: a silently-wrong tax calculation or a recurring transaction that double-fires is worse than a button not re-rendering.

---

## Domain Logic / Business Rules

**Q: Explain the recurring-transaction catch-up logic.**
A: `processDueRecurring()` doesn't just check "is today the due date" — it loops: `while (cur.nextDate <= today) { materialize a transaction; advance cur.nextDate by the frequency }`. That matters because if someone doesn't open the app for, say, three months, a monthly recurring bill should generate three transactions, not one (or none). Dates are anchored to `T12:00:00` (noon) specifically so date-only arithmetic doesn't get bumped to the wrong calendar day by a timezone offset near midnight — a small detail, but it's the kind of date bug that's easy to introduce and annoying to debug.

**Q: How does multi-currency entry work?**
A: Everything is normalized to and stored in MMK (the base currency), computed as `enteredAmount * (mmkRate / enteredCurrencyRate)` against live exchange rates. The original entered amount and currency are retained on the record (`origAmount`, `currency`) purely for display, so the user still sees "500 USD" even though the stored, aggregate-friendly value is the MMK equivalent. That's a standard and correct pattern — pick one canonical unit for all arithmetic/aggregation, keep the original for presentation.

**Q: What would break if exchange rates were unavailable when a foreign-currency transaction was entered?**
A: Looking at `handleAddTransaction` in `App.js`: it only converts if `exchangeRates?.rates` exists and the specific currency's rate is present; otherwise it stores the entered amount as-is under the selected currency without conversion. That's a reasonable fallback (never blocks the user from saving), but it does mean a transaction entered during a rates outage could get silently double-counted against MMK totals if rates return later without a reconciliation pass — worth a defensive check if this went to production for real users.

**Q: Walk me through what happens end-to-end when a user saves a transaction.**
A: `handleAddTransaction` in `App.js` validates amount and tag are present, computes the MMK-normalized `storedAmount` if a foreign currency is selected, calls `addTransaction()` (which `db.js` routes to whichever storage backend is active), then re-fetches the full transaction list with `getTransactions()` and replaces state wholesale — it doesn't optimistically append the new record locally. That's simple and correct at this data scale (a personal tracker's dataset is small), but it does mean every write pays a full round-trip re-read; at a much larger scale I'd switch to optimistic local append with reconciliation.

---

## Scaling / "What Would You Do Differently"

**Q: If this needed a real backend/sync tomorrow, what changes?**
A: The storage router (`db.js`) is actually a decent seam for this — it already abstracts "where does data live" behind one interface, so adding a third backend (`storage/api.js` hitting a real server) wouldn't require touching any component. The harder part is conflict resolution: right now every write does a full read-and-replace, which doesn't survive concurrent multi-device edits. I'd want each record to carry an `updatedAt`/version and move to a last-write-wins or CRDT-style merge, plus an offline queue for writes made while disconnected — which the PWA/service-worker foundation already partially supports.

**Q: What would you change about how feature flags work?**
A: Right now they're independent booleans in localStorage, which works fine for "show/hide a widget" but doesn't scale to anything with rollout percentages, targeting, or remote config. For a single local app that's the right amount of complexity — I wouldn't reach for a flagging service here. If this became multi-user, I'd want them centralized in one settings object with a schema/versioning story instead of scattered `localStorage.getItem('featureX') === 'true'` calls.

**Q: The app has ~50 components and one 1,300-line root file — is that a smell?**
A: The line count alone isn't damning for a component that's genuinely the single owner of app-wide state in a no-Context architecture — but it's a strong signal that the architecture has outgrown its original shape, which is exactly what happened here (this grew from a simple 2-tab tracker into a full personal-finance app across many commits). The concrete fix is the custom-hooks-plus-Context split described above, done incrementally file by file rather than as one risky rewrite.

**Q: How would you approach code-splitting this app further?**
A: Two candidates beyond the existing `xlsx`/`file-saver` lazy import: (1) `react-datepicker` and its CSS are loaded upfront for every user even though the date picker is only opened when adding/editing a transaction — a reasonable `React.lazy` candidate; (2) the ~10 analytics widgets on the Balance tab (`CashFlowCalendar`, `TagExpenseHeatmap`, forecasting cards, etc.) are all mounted whenever that tab is active regardless of whether the user scrolls to see them — `React.lazy` + `Suspense` per-widget, or at minimum an intersection-observer-gated render, would cut initial Balance-tab render cost.

---

## Behavioral / Reflective

**Q: What are you most proud of in this project?**
A: The recurring-transaction catch-up logic and the PIN lockout escalation — both are small pieces of code that handle a real edge case correctly (multi-period backfill; escalating lockout timers) rather than the naive version that looks right until you test the boundary.

**Q: What would you do differently if starting over?**
A: Start with a `useReducer`-based store for transactions from day one instead of individual `useState` calls, and write utils with tests as I wrote them rather than after. Both are cheap early and expensive late — exactly what happened here.

**Q: How do you decide when a hand-rolled solution (e.g. the CSV parser, the calendar grid) is okay versus reaching for a library?**
A: By what the "library tax" buys you. The hand-rolled CSV parser is a real gap (it isn't RFC 4180-complete — no escaped quotes, no embedded newlines in quoted fields) and I'd swap it for PapaParse in a real product since CSV export from other tools genuinely produces those edge cases. The hand-rolled calendar grid and heatmap, on the other hand, are simple enough (a month's worth of day cells, colored by one computed value) that a calendar library would add more API surface than it saves — that one I'd keep.
