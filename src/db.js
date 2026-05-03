import { openDB } from "idb";

const initDB = async () => {
  return openDB("BudgetTrackerDB", 5, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("tags")) {
        const tagsStore = db.createObjectStore("tags", { keyPath: "id", autoIncrement: true });
        tagsStore.transaction.oncomplete = () => {
          const defaultData = [
            { id: 1, name: "Taxi Fee", type: "expense", colorIndex: 0 },
            { id: 2, name: "Salary",   type: "income",  colorIndex: 1 },
          ];
          const tx = db.transaction("tags", "readwrite");
          const store = tx.objectStore("tags");
          defaultData.forEach((item) => store.add(item));
        };
      } else if (oldVersion < 5) {
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

export const editTag = async (id, updatedTag) => {
  const db = await initDB();
  const tx = db.transaction("tags", "readwrite");
  const store = tx.objectStore("tags");
  const existing = await store.get(id);
  if (!existing) throw new Error(`Tag with id ${id} not found`);
  await store.put({ ...existing, ...updatedTag });
};
