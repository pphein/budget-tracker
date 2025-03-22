import { openDB } from "idb";

// Initialize the database
const initDB = async () => {
  return openDB("BudgetTrackerDB", 4, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("tags")) {
        const tags = db.createObjectStore("tags", { keyPath: "id", autoIncrement: true });
        tags.transaction.oncomplete = () => {
            const defaultData = [
                { id: 1, name: "Taxi Fee", type: "expense" },
                { id: 2, name: "Salary", type: "income" },
            ];
            const tx = db.transaction("tags", "readwrite");
            const store = tx.objectStore("tags");
            defaultData.forEach((item) => store.add(item));
        };
      }
    }
  });
};

// const intiTags = async () => {
//     const db = await initDB();
//     const tx = db.transaction("tags", "readwrite");
//     const store = tx.objectStore("tags");
//     const defaultData = [
//         { id: 1, name: "Taxi Fee", type: "expense" },
//         { id: 2, name: "Salary", type: "income" },
//     ];
//     defaultData.forEach((item) => store.add(item));    
// }

// Add transaction
export const addTransaction = async (transaction) => {
  const db = await initDB();
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");
  await store.add(transaction);
};

// Get all transactions
export const getTransactions = async () => {
  const db = await initDB();
  return db.getAll("transactions");
};

// Delete transaction
export const deleteTransaction = async (id) => {
  const db = await initDB();
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");
  await store.delete(id);
};
// Edit transaction
export const editTransaction = async (id, updatedTransaction) => {
    const db = await initDB();
    const tx = db.transaction("transactions", "readwrite");
    const store = tx.objectStore("transactions");
    const existingTransaction = await store.get(id);
    if (!existingTransaction) {
        throw new Error(`Transaction with id ${id} not found`);
    }
    const updatedData = { ...existingTransaction, ...updatedTransaction };
    await store.put(updatedData);
};

// Add tag
export const addTag = async (tag) => {
    const db = await initDB();
    const tx = db.transaction("tags", "readwrite");
    const store = tx.objectStore("tags");
    await store.add(tag);
  };
  
  // Get all tags
  export const getTags = async () => {
    const db = await initDB();
    return db.getAll("tags");
  };
  
  // Delete tag
  export const deleteTag = async (id) => {
    const db = await initDB();
    const tx = db.transaction("tags", "readwrite");
    const store = tx.objectStore("tags");
    await store.delete(id);
  };
