import { openDB } from "idb";

const DEFAULT_TAGS = [
  // Income
  { name: "Salary",           type: "income",  colorIndex: 1 },
  { name: "Overtime Pay",     type: "income",  colorIndex: 2 },
  { name: "Passive Income",   type: "income",  colorIndex: 3 },
  // Expense
  { name: "Taxi Fee",         type: "expense", colorIndex: 0 },
  { name: "Food & Dining",    type: "expense", colorIndex: 1 },
  { name: "Groceries",        type: "expense", colorIndex: 2 },
  { name: "Transportation",   type: "expense", colorIndex: 3 },
  { name: "Fuel",             type: "expense", colorIndex: 4 },
  { name: "Rent",             type: "expense", colorIndex: 5 },
  { name: "Utilities",        type: "expense", colorIndex: 6 },
  { name: "Electricity",      type: "expense", colorIndex: 7 },
  { name: "Water Bill",       type: "expense", colorIndex: 8 },
  { name: "Internet",         type: "expense", colorIndex: 9 },
  { name: "Phone Bill",       type: "expense", colorIndex: 0 },
  { name: "Healthcare",       type: "expense", colorIndex: 1 },
  { name: "Medicine",         type: "expense", colorIndex: 2 },
  { name: "Insurance",        type: "expense", colorIndex: 3 },
  { name: "Education",        type: "expense", colorIndex: 4 },
  { name: "Entertainment",    type: "expense", colorIndex: 5 },
  { name: "Shopping",         type: "expense", colorIndex: 6 },
  { name: "Clothing",         type: "expense", colorIndex: 7 },
  { name: "Personal Care",    type: "expense", colorIndex: 8 },
  { name: "Gym",              type: "expense", colorIndex: 9 },
  { name: "Travel",           type: "expense", colorIndex: 0 },
  { name: "Hotel",            type: "expense", colorIndex: 1 },
  { name: "Dining Out",       type: "expense", colorIndex: 2 },
  { name: "Coffee",           type: "expense", colorIndex: 3 },
  { name: "Subscriptions",    type: "expense", colorIndex: 4 },
  { name: "Home Maintenance", type: "expense", colorIndex: 5 },
  { name: "Repairs",          type: "expense", colorIndex: 6 },
  { name: "Childcare",        type: "expense", colorIndex: 7 },
  { name: "Pet Care",         type: "expense", colorIndex: 8 },
  { name: "Donations",        type: "expense", colorIndex: 9 },
  { name: "Snacks",           type: "expense", colorIndex: 0 },
];

const initDB = async () => {
  return openDB("BudgetTrackerDB", 7, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("tags")) {
        // Fresh install — seed all default tags
        const tagsStore = db.createObjectStore("tags", { keyPath: "id", autoIncrement: true });
        tagsStore.transaction.oncomplete = () => {
          const tx = db.transaction("tags", "readwrite");
          const store = tx.objectStore("tags");
          DEFAULT_TAGS.forEach((tag) => store.add(tag));
        };
      } else {
        if (oldVersion < 5) {
          // Backfill colorIndex on existing tags
          const store = transaction.objectStore("tags");
          const req = store.openCursor();
          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (!cursor) return;
            if (cursor.value.colorIndex === undefined) {
              cursor.update({ ...cursor.value, colorIndex: cursor.value.id % 10 });
            }
            cursor.continue();
          };
        }
        if (oldVersion < 7) {
          // Add all missing default tags (income + expense)
          const store = transaction.objectStore("tags");
          const getAllReq = store.getAll();
          getAllReq.onsuccess = () => {
            const existingNames = getAllReq.result.map((t) => t.name.toLowerCase());
            DEFAULT_TAGS.forEach((tag) => {
              if (!existingNames.includes(tag.name.toLowerCase())) {
                store.add(tag);
              }
            });
          };
        }
      }
    },
  });
};

export const addTransaction = async (transaction) => {
  const db = await initDB();
  const tx = db.transaction("transactions", "readwrite");
  await tx.objectStore("transactions").add(transaction);
};

export const getTransactions = async () => {
  const db = await initDB();
  return db.getAll("transactions");
};

export const deleteTransaction = async (id) => {
  const db = await initDB();
  const tx = db.transaction("transactions", "readwrite");
  await tx.objectStore("transactions").delete(id);
};

export const editTransaction = async (id, updatedTransaction) => {
  const db = await initDB();
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");
  const existing = await store.get(id);
  if (!existing) throw new Error(`Transaction with id ${id} not found`);
  await store.put({ ...existing, ...updatedTransaction });
};

export const addTag = async (tag) => {
  const db = await initDB();
  const tx = db.transaction("tags", "readwrite");
  await tx.objectStore("tags").add(tag);
};

export const getTags = async () => {
  const db = await initDB();
  return db.getAll("tags");
};

export const deleteTag = async (id) => {
  const db = await initDB();
  const tx = db.transaction("tags", "readwrite");
  await tx.objectStore("tags").delete(id);
};

export const clearTagsByType = async (type) => {
  const db = await initDB();
  const all = await db.getAll("tags");
  const tx = db.transaction("tags", "readwrite");
  const store = tx.objectStore("tags");
  all.filter((t) => t.type === type).forEach((t) => store.delete(t.id));
  await tx.done;
};

// Adds any DEFAULT_TAGS missing from the local DB — safe to call anytime
export const syncDefaultTags = async () => {
  const db = await initDB();
  const existing = await db.getAll("tags");
  const existingNames = existing.map((t) => t.name.toLowerCase());
  const tx = db.transaction("tags", "readwrite");
  const store = tx.objectStore("tags");
  DEFAULT_TAGS.forEach((tag) => {
    if (!existingNames.includes(tag.name.toLowerCase())) {
      store.add(tag);
    }
  });
  await tx.done;
  return db.getAll("tags"); // return updated list
};

export const editTag = async (id, updatedTag) => {
  const db = await initDB();
  const tx = db.transaction("tags", "readwrite");
  const store = tx.objectStore("tags");
  const existing = await store.get(id);
  if (!existing) throw new Error(`Tag with id ${id} not found`);
  await store.put({ ...existing, ...updatedTag });
};
