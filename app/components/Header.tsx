import React from 'react';
import Link from 'next/link';
import SearchCalculatorsInput from './SearchCalculatorsInput';

type HeaderProps = {
  search?: string;
  setSearch?: (val: string) => void;
};

export default function Header({ search, setSearch }: HeaderProps) {
  return (
    <header className="w-full bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900 hover:underline focus:outline-none">Calcx</Link>
        </div>
        <nav className="hidden md:flex gap-8 text-gray-700 font-medium text-base">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <a href="#calculators" className="hover:text-black transition">Calculators</a>
        </nav>
        {search !== undefined && setSearch !== undefined && (
          <div className="ml-4 w-48 max-w-xs flex-shrink-0">
            <SearchCalculatorsInput search={search} setSearch={setSearch} />
          </div>
        )}
      </div>
    </header>
  );
} 