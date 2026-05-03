import React from 'react';

const SkeletonRows = ({ count = 4 }) => (
  <div className="animate-pulse space-y-2 p-2 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>
    ))}
  </div>
);

export default SkeletonRows;
