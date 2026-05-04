export const COLOR_THEMES = [
  { id: 'blue',   label: 'Blue',   colors: { 50:'#eff6ff', 100:'#dbeafe', 200:'#bfdbfe', 300:'#93c5fd', 400:'#60a5fa', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8', 800:'#1e40af', 900:'#1e3a8a' } },
  { id: 'green',  label: 'Green',  colors: { 50:'#f0fdf4', 100:'#dcfce7', 200:'#bbf7d0', 300:'#86efac', 400:'#4ade80', 500:'#22c55e', 600:'#16a34a', 700:'#15803d', 800:'#166534', 900:'#14532d' } },
  { id: 'purple', label: 'Purple', colors: { 50:'#faf5ff', 100:'#f3e8ff', 200:'#e9d5ff', 300:'#d8b4fe', 400:'#c084fc', 500:'#a855f7', 600:'#9333ea', 700:'#7e22ce', 800:'#6b21a8', 900:'#581c87' } },
  { id: 'rose',   label: 'Rose',   colors: { 50:'#fff1f2', 100:'#ffe4e6', 200:'#fecdd3', 300:'#fda4af', 400:'#fb7185', 500:'#f43f5e', 600:'#e11d48', 700:'#be123c', 800:'#9f1239', 900:'#881337' } },
  { id: 'orange', label: 'Orange', colors: { 50:'#fff7ed', 100:'#ffedd5', 200:'#fed7aa', 300:'#fdba74', 400:'#fb923c', 500:'#f97316', 600:'#ea580c', 700:'#c2410c', 800:'#9a3412', 900:'#7c2d12' } },
  { id: 'teal',   label: 'Teal',   colors: { 50:'#f0fdfa', 100:'#ccfbf1', 200:'#99f6e4', 300:'#5eead4', 400:'#2dd4bf', 500:'#14b8a6', 600:'#0d9488', 700:'#0f766e', 800:'#115e59', 900:'#134e4a' } },
  { id: 'indigo', label: 'Indigo', colors: { 50:'#eef2ff', 100:'#e0e7ff', 200:'#c7d2fe', 300:'#a5b4fc', 400:'#818cf8', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca', 800:'#3730a3', 900:'#312e81' } },
  { id: 'amber',  label: 'Amber',  colors: { 50:'#fffbeb', 100:'#fef3c7', 200:'#fde68a', 300:'#fcd34d', 400:'#fbbf24', 500:'#f59e0b', 600:'#d97706', 700:'#b45309', 800:'#92400e', 900:'#78350f' } },
];

const rgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
};

const generateCSS = (t) => `
  .bg-blue-50  { background-color: ${t[50]}  !important; }
  .bg-blue-100 { background-color: ${t[100]} !important; }
  .bg-blue-500 { background-color: ${t[500]} !important; }
  .bg-blue-600 { background-color: ${t[600]} !important; }
  .bg-blue-700 { background-color: ${t[700]} !important; }
  .text-blue-200 { color: ${t[200]} !important; }
  .text-blue-300 { color: ${t[300]} !important; }
  .text-blue-400 { color: ${t[400]} !important; }
  .text-blue-500 { color: ${t[500]} !important; }
  .text-blue-600 { color: ${t[600]} !important; }
  .text-blue-700 { color: ${t[700]} !important; }
  .text-blue-800 { color: ${t[800]} !important; }
  .border-blue-500 { border-color: ${t[500]} !important; }
  .border-b-2.border-blue-500 { border-bottom-color: ${t[500]} !important; }
  .ring-blue-400, .focus\\:ring-blue-400:focus { --tw-ring-color: ${t[400]} !important; }
  .ring-blue-500 { --tw-ring-color: ${t[500]} !important; }
  .ring-2.ring-blue-400 { --tw-ring-color: ${t[400]} !important; }
  .hover\\:bg-blue-600:hover  { background-color: ${t[600]} !important; }
  .hover\\:bg-blue-700:hover  { background-color: ${t[700]} !important; }
  .active\\:bg-blue-600:active { background-color: ${t[600]} !important; }
  .hover\\:bg-blue-100:hover  { background-color: ${t[100]} !important; }
  .hover\\:text-blue-500:hover { color: ${t[500]} !important; }

  /* dark mode */
  .dark .dark\\:text-blue-200 { color: ${t[200]} !important; }
  .dark .dark\\:text-blue-300 { color: ${t[300]} !important; }
  .dark .dark\\:text-blue-400 { color: ${t[400]} !important; }
  .dark .dark\\:bg-blue-800   { background-color: ${t[800]} !important; }
  .dark .dark\\:ring-blue-400 { --tw-ring-color: ${t[400]} !important; }
  .dark .dark\\:bg-blue-900\\/20 { background-color: rgb(${rgb(t[900])} / 0.2) !important; }
  .dark .dark\\:bg-blue-900\\/30 { background-color: rgb(${rgb(t[900])} / 0.3) !important; }
  .dark .dark\\:bg-blue-900\\/40 { background-color: rgb(${rgb(t[900])} / 0.4) !important; }
  .dark .dark\\:bg-blue-900\\/60 { background-color: rgb(${rgb(t[900])} / 0.6) !important; }
  .dark .dark\\:hover\\:bg-blue-900\\/50:hover { background-color: rgb(${rgb(t[900])} / 0.5) !important; }
  .dark .dark\\:border-blue-700 { border-color: ${t[700]} !important; }
  .dark .dark\\:bg-blue-900 { background-color: ${t[900]} !important; }

  /* Tailwind light mode active/hover with bg-blue-100 */
  .bg-blue-100.text-blue-900, .text-blue-900 { color: ${t[900]} !important; }
  .text-blue-100 { color: ${t[100]} !important; }
`;

export const getInitialColorTheme = () => localStorage.getItem('colorTheme') || 'blue';

export const applyColorTheme = (themeId) => {
  const theme = COLOR_THEMES.find((t) => t.id === themeId) || COLOR_THEMES[0];
  let style = document.getElementById('color-theme-override');
  if (!style) {
    style = document.createElement('style');
    style.id = 'color-theme-override';
    document.head.appendChild(style);
  }
  style.textContent = generateCSS(theme.colors);
  localStorage.setItem('colorTheme', themeId);
};
