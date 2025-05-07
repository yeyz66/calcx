import React from 'react';

type Props = {
  search: string;
  setSearch: (val: string) => void;
};

export default function SearchCalculatorsInput({ search, setSearch }: Props) {
  return (
    <div className="mb-0">
      <input
        type="text"
        placeholder="Search calculators..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-3 py-1.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none text-base shadow-sm transition h-8"
      />
    </div>
  );
} 