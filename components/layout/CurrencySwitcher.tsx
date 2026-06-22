'use client';

import { useCurrency } from '@/hooks/useCurrency';

export default function CurrencySwitcher() {
  const { currency, changeCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => changeCurrency('USD')}
        className={`px-2 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all ${
          currency === 'USD'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        USD
      </button>
      <button
        onClick={() => changeCurrency('CDF')}
        className={`px-2 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all ${
          currency === 'CDF'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        CDF
      </button>
    </div>
  );
}