# Budget Tracker — Update & Upgrade Ideas

---

## Bug Fixes (Do First)

- **`EditAmountModal` still uses native `alert()`** (`components/EditAmountModal.js:9`)
  - Replace with the existing `InfoModal` pattern used in `App.js`

- **`formatDateTime` has hardcoded 392-minute offset** (`App.js:187`)
  - `dateObj.setMinutes(dateObj.getMinutes() + 392)` — this is 6h32m, likely a timezone hack
  - Replace with proper timezone handling using `Intl.DateTimeFormat` with a timezone option

- **`RecordList` has dead internal filter state** (`components/RecordList.js:6-8`)
  - `tagFilter`, `startDate`, `endDate` states are declared but never updated by UI
  - The `filteredRecords` inside uses `record.datetime` (wrong field, should be `record.date`)
  - Remove the dead state; filtering is already handled by the parent

- **Balance view table has no date sorting**
  - `Object.values(transactions.reduce(...))` is not sorted by date
  - Add `.sort((a, b) => new Date(a.date) - new Date(b.date))`

---

## Technical Upgrades

- **Delete unused files**
  - `src/components/BudgetTracker.js` — legacy, not used anywhere
  - `src/components/IncomeExpenseTabs.js` — legacy, not used anywhere
  - `src/components/TagInput.js` — legacy, not used anywhere
  - `src/storage.js` — localStorage helper, fully replaced by IndexedDB

- **Upgrade Tailwind CSS from v3 to v4**
  - v4 drops `tailwind.config.js` in favor of CSS-based config
  - Faster build, smaller output, native CSS cascade layers

- **Upgrade Headless UI to v2 stable patterns**
  - Replace deprecated `Transition` + `as={Fragment}` pattern with the new `transition` prop on `Listbox.Options`
  - Cleaner, less boilerplate

- **Replace `xlsx` (SheetJS) with a lighter alternative**
  - `xlsx` is 800KB+ and has had license issues
  - Consider `exceljs` or just CSV export for simplicity

- **Extract `InfoModal` into its own component file**
  - Currently inline in `App.js`
  - Move to `src/components/InfoModal.js` for reuse (e.g. `EditAmountModal` needs it)

---

## UI/UX Improvements

---

### 1. Mobile Bottom Navigation Bar

Replace the top tab bar with a fixed bottom nav. Easier thumb reach on phones.

```
+----------------------------------+
|                                  |
|         (page content)           |
|                                  |
|                                  |
+----------------------------------+
|  [^ Income]  [v Expense] [= Bal] |
+----------------------------------+
```

- Active tab shows colored icon + label
- Inactive tabs are gray
- Use heroicons: `ArrowUpCircle`, `ArrowDownCircle`, `ScaleIcon`

---

### 2. Summary Cards at the Top

Show a quick-glance summary row above the transaction list — replaces having to scroll to see totals.

```
+----------------------------------+
|  Income Tab                      |
+----------+----------+------------+
|  Income  | Expense  |    Net     |
| +125,000 | -43,500  |  +81,500   |
+----------+----------+------------+
|  (filter + record list below)    |
```

- Green for income, red for expense, blue for net
- Numbers update live as filters change
- Tap a card to jump to that tab (income/expense cards are tappable)

---

### 3. Tag Chips with Color Badges

Replace plain text tag dropdown with colored chip badges. Each tag gets a color automatically assigned.

**Tag selector in form:**
```
+----------------------------------+
| Tag:                             |
| [● Salary] [● Taxi Fee] [+ Add]  |
+----------------------------------+
```

**Tag in record list:**
```
| ● Salary      | 50,000 | May 1 |
| ● Taxi Fee    |  3,500 | May 2 |
```

- Auto-assign color from a palette when tag is created
- Store `color` field in the `tags` object store
- Show colored dot/pill in both the form and the list

---

### 4. Full Transaction Edit Modal

Currently only amount is editable. Expand to allow editing tag and date too.

```
+-------------------------------+
|  Edit Transaction             |
|-------------------------------|
|  Tag:   [ Salary          v ] |
|  Date:  [ 01-05-2026      v ] |
|  Amount:[ 50,000             ]|
|-------------------------------|
|          [Cancel]   [Save]    |
+-------------------------------+
```

- Rename `EditAmountModal` → `EditTransactionModal`
- Reuse same `Listbox` dropdown from the main form for tag selection
- Reuse `DatePicker` for date

---

### 5. Delete Confirmation Dialog

Currently "Del" deletes instantly. Add a small inline confirm step.

```
+-------------------------------+
|  Delete Transaction?          |
|  Salary — 50,000 — May 1     |
|-------------------------------|
|      [Cancel]   [Delete]      |
+-------------------------------+
```

- Show transaction details (tag + amount + date) so user knows what they're deleting
- "Delete" button is red, "Cancel" is gray

---

### 6. Empty State Screen

Replace plain "No records found" text with a helpful visual.

```
+----------------------------------+
|                                  |
|          (wallet icon)           |
|                                  |
|      No income records yet.      |
|   Tap Save to add your first.    |
|                                  |
+----------------------------------+
```

- Different message per tab: "No income records", "No expense records"
- Use a heroicon (e.g. `BanknotesIcon`) as the illustration

---

### 7. Toast Notifications

Show a brief slide-up toast after save, delete, or export — currently there is zero success feedback.

```
+----------------------------------+
|                                  |
|                                  |
| +------------------------------+ |
| |  Saved successfully          | |  <-- slides up, auto-dismisses
| +------------------------------+ |
+----------------------------------+
```

- Green toast for save/export, red for delete
- Auto-dismiss after 2 seconds
- Position: bottom-center, above the bottom nav bar

---

### 8. Record List — Sortable Columns + Running Total

Add sort controls on table headers and a running balance column.

```
+-------+----------+---------+--------+----------+
| Tag   | Amount v | Date    | Action | Running  |
+-------+----------+---------+--------+----------+
| Sal.  | 50,000   | May 1   | Ed Del |  50,000  |
| Sal.  | 50,000   | May 15  | Ed Del | 100,000  |
| Bonus | 20,000   | May 20  | Ed Del | 120,000  |
+-------+----------+---------+--------+----------+
| Total | 120,000  |         |        |          |
+-------+----------+---------+--------+----------+
```

- Click column header to toggle asc/desc sort (show arrow indicator)
- Running total column shows cumulative sum down the list
- Default sort: newest date first

---

### 9. Balance Tab — Chart + Summary

Add a bar chart above the balance table and a totals summary row.

```
+----------------------------------+
|  Daily Balance   [Export]        |
|  Date Range: [May 1 — May 31]    |
|----------------------------------|
|  60k |    ##                     |
|  40k |    ##  ##                 |
|  20k | ## ##  ##  ##             |
|   0k +--+--+--+--+--+--         |
|       1  5  10 15 20 25          |
|       -- Income  -- Expense      |
|----------------------------------|
| Date    | Income | Expense | Net |
|---------|--------|---------|-----|
| May 1   | 50,000 |  3,500  | ... |
| May 2   |      0 |  8,000  | ... |
|---------|--------|---------|-----|
| TOTAL   | 50,000 | 11,500  | ... |
+----------------------------------+
```

- Use `recharts` `BarChart` component
- Summary totals row pinned at the bottom of the table
- Export button exports the filtered date range

---

### 10. Dark Mode

Support system dark mode via Tailwind `dark:` classes.

**Light:**
```
+----------------------------------+
| [white bg]  Tag | Amount | Date  |
| Salary      50,000   May 1       |
+----------------------------------+
```

**Dark:**
```
+----------------------------------+
| [gray-900]  Tag | Amount | Date  |
| Salary      50,000   May 1       |
+----------------------------------+
```

- Top nav / bottom nav: `bg-gray-900 text-white`
- Cards and table: `bg-gray-800 border-gray-700`
- Inputs: `bg-gray-700 text-white placeholder-gray-400`
- Automatically follows `prefers-color-scheme` with no manual toggle needed

---

### 11. Skeleton Loading State

Show placeholder rows while IndexedDB loads — currently the list just appears empty then pops in.

```
+----------------------------------+
| [████████]  [██████]  [███████]  |  <- shimmer animation
| [████████]  [██████]  [███████]  |
| [████████]  [██████]  [███████]  |
+----------------------------------+
```

- 3–5 skeleton rows with gray shimmer animation (`animate-pulse`)
- Replace with real data once `getTransactions()` resolves

---

### 12. Tags Management Page (Dedicated View)

Instead of managing tags inside the main form, add a dedicated tags page accessible from a settings icon.

```
+----------------------------------+
|  < Back       Tags (Income)      |
|----------------------------------|
|  ● Salary          [Edit] [Del]  |
|  ● Bonus           [Edit] [Del]  |
|  ● Freelance       [Edit] [Del]  |
|----------------------------------|
|  + Add New Tag                   |
+----------------------------------+
```

- Accessible via a gear/settings icon in the top-right corner of the app
- Separate views for income tags and expense tags
- Inline rename: tap Edit → input appears in place
- Validate no duplicate names on save
