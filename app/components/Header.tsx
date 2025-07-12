import React from 'react';
import Link from 'next/link';
import SearchCalculatorsInput from './SearchCalculatorsInput';

type HeaderProps = {
  search?: string;
  setSearch?: (val: string) => void;
  onSearchFocus?: (focused: boolean) => void;
};

export default function Header({ search, setSearch, onSearchFocus }: HeaderProps) {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
              Calcx
            </span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
          </Link>
          <a 
            href="#calculators" 
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
          >
            Calculators
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
          </a>
          {process.env.NODE_ENV === 'development' && (
            <Link 
              href="/calculator-builder" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
            >
              Builder
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
            </Link>
          )}
        </nav>
        
        {search !== undefined && setSearch !== undefined && (
          <div className="hidden sm:block w-64 max-w-xs">
            <SearchCalculatorsInput 
              search={search} 
              setSearch={setSearch}
              onFocus={onSearchFocus}
            />
          </div>
        )}
        
        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
} 