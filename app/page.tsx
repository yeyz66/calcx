'use client';
import Header from './components/Header';
import CalculatorGroups from './components/CalculatorGroups';
import Footer from './components/Footer';
import ScientificCalculator from './components/ScientificCalculator';
import React, { useState, useEffect } from 'react';

export default function Home() {
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFeaturedCalc, setShowFeaturedCalc] = useState(true);

  useEffect(() => {
    setShowFeaturedCalc(search === '' && !isSearchFocused);
  }, [search, isSearchFocused]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header 
        search={search} 
        setSearch={setSearch} 
        onSearchFocus={setIsSearchFocused}
      />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                Professional
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Calculator Suite
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                20+ specialized calculators for finance, health, engineering, and scientific calculations
              </p>
              
              {/* Enhanced Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search calculators... (e.g., loan, body fat, time)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-12 pr-6 py-4 text-lg rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm focus:ring-4 focus:ring-white/30 focus:outline-none transition-all duration-300 placeholder-gray-500"
                  />
                </div>
                {/* Search suggestions overlay */}
                {isSearchFocused && (
                  <div className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 p-3 z-50">
                    <div className="text-sm text-gray-600 font-medium mb-2">Popular searches:</div>
                    <div className="flex flex-wrap gap-2">
                      {['payment calculator', 'body fat', 'scientific', 'time card', 'roth ira'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearch(term)}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Calculator Section */}
        {showFeaturedCalc && (
          <section className="py-12 sm:py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Featured Calculator
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Try our advanced scientific calculator with comprehensive mathematical functions
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl border border-gray-100">
                <ScientificCalculator />
              </div>
            </div>
          </section>
        )}

        {/* Calculator Groups Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {search ? 'Search Results' : 'All Calculators'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {search ? `Found calculators matching "${search}"` : 'Explore our comprehensive collection of specialized calculators'}
              </p>
            </div>
            
            <CalculatorGroups search={search} />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}