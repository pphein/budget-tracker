export const TAG_COLORS = [
  { dot: 'bg-blue-500',   bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200' },
  { dot: 'bg-green-500',  bg: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200' },
  { dot: 'bg-yellow-500', bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200' },
  { dot: 'bg-purple-500', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200' },
  { dot: 'bg-pink-500',   bg: 'bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-200' },
  { dot: 'bg-indigo-500', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200' },
  { dot: 'bg-red-500',    bg: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200' },
  { dot: 'bg-orange-500', bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200' },
  { dot: 'bg-teal-500',   bg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200' },
  { dot: 'bg-cyan-500',   bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200' },
];

export const getTagColorClasses = (colorIndex) => {
  const idx = (colorIndex !== undefined && colorIndex !== null) ? colorIndex : 0;
  return TAG_COLORS[idx % TAG_COLORS.length];
};
