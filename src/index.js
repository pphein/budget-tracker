import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { getInitialColorTheme, applyColorTheme } from './utils/colorTheme';

// Apply saved color theme before first render to avoid flash
applyColorTheme(getInitialColorTheme());

// Register the jeep-sqlite web component (required for web/PWA SQLite)
jeepSqlite(window);

const initSQLiteAndRender = async () => {
  if (!Capacitor.isNativePlatform()) {
    await customElements.whenDefined('jeep-sqlite');

    const jeepEl = document.querySelector('jeep-sqlite');

    // 🔥 IMPORTANT: set wasm path
    jeepEl.autoSave = true;

    const sqlite = new SQLiteConnection(CapacitorSQLite);
    await sqlite.initWebStore();
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

initSQLiteAndRender();
serviceWorkerRegistration.register();
