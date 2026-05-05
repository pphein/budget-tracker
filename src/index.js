import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { getInitialColorTheme, applyColorTheme } from './utils/colorTheme';

// Apply saved color theme before first render to avoid flash
applyColorTheme(getInitialColorTheme());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register();
