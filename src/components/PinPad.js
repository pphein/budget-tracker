import React from 'react';
import { BackspaceIcon } from '@heroicons/react/24/outline';
import { PIN_LENGTH } from '../utils/pin';

// Layout: 1-9, blank, 0, backspace
const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'];

const PinPad = ({ digits, onKey, shake, error, title, subtitle }) => (
  <div className="flex flex-col items-center">
    {/* Title */}
    <p className="text-gray-300 text-sm font-medium mb-6">{title}</p>

    {/* Dots */}
    <div className={`flex gap-4 mb-3 ${shake ? 'animate-pin-shake' : ''}`}>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full transition-all duration-150 ${
            i < digits.length
              ? 'bg-[var(--primary-400)] scale-110'
              : 'border-2 border-gray-600'
          }`}
        />
      ))}
    </div>

    {/* Error */}
    <div className="h-5 mb-6 flex items-center">
      {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
    </div>

    {/* Numpad */}
    <div className="grid grid-cols-3 gap-3 w-64">
      {KEYS.map((key, i) => {
        if (key === '') return <div key={i} />;
        return (
          <button
            key={key}
            onClick={() => onKey(key)}
            className={`h-16 rounded-2xl text-xl font-semibold transition-all active:scale-95 select-none ${
              key === 'del'
                ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 flex items-center justify-center'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {key === 'del' ? <BackspaceIcon className="w-6 h-6" /> : key}
          </button>
        );
      })}
    </div>

    {subtitle && (
      <p className="mt-6 text-xs text-gray-600">{subtitle}</p>
    )}
  </div>
);

export default PinPad;
