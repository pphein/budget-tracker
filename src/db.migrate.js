import { openDB } from 'idb';

const MIGRATION_KEY = 'sqlite_migrated_v1';

/**
 * One-time migration from IndexedDB (BudgetTrackerDB) → SQLite.
 * Called inside initDB() after schema is created.
 * Sets a localStorage flag when done so it never runs again.
 */
export const migrateFromIndexedDB = async (db) => {
  if (localStorage.getItem(MIGRATION_KEY)) return;

  try {
    const oldDb = await openDB('BudgetTrackerDB');

    const [oldTransactions, oldTags] = await Promise.all([
      oldDb.getAll('transactions'),
      oldDb.getAll('tags'),
    ]);

    oldDb.close();

    if (oldTags.length > 0) {
      // Replace seeded defaults with the user's actual tags (preserving IDs)
      await db.run('DELETE FROM tags');
      await db.executeSet(
        oldTags.map((t) => ({
          statement: 'INSERT INTO tags (id, name, type, colorIndex) VALUES (?, ?, ?, ?)',
          values: [t.id, t.name, t.type, t.colorIndex ?? 0],
        }))
      );
    }

    if (oldTransactions.length > 0) {
      await db.executeSet(
        oldTransactions.map((t) => ({
          statement: 'INSERT INTO transactions (id, type, tag, amount, date) VALUES (?, ?, ?, ?, ?)',
          values: [t.id, t.type, t.tag, parseFloat(t.amount), t.date],
        }))
      );
    }

    console.log(`[Migration] ${oldTags.length} tags, ${oldTransactions.length} transactions moved to SQLite`);
  } catch {
    // No old DB found — fresh install, nothing to migrate
  }

  localStorage.setItem(MIGRATION_KEY, '1');
};
