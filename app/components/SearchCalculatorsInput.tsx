import React from 'react';

type Props = {
  search: string;
  setSearch: (val: string) => void;
  onFocus?: (focused: boolean) => void;
};

export default function SearchCalculatorsInput({ search, setSearch, onFocus }: Props) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => onFocus?.(true)}
        onBlur={() => onFocus?.(false)}
        className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 placeholder-gray-500"
      />
    </div>
  );
} 