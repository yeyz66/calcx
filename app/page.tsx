'use client';
import Header from './components/Header';
import CalculatorGroups from './components/CalculatorGroups';
import Footer from './components/Footer';
import ScientificCalculator from './components/ScientificCalculator';
import React, { useState } from 'react';

export default function Home() {
  const [search, setSearch] = useState('');
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      <Header search={search} setSearch={setSearch} />
      <main className="flex-1 flex flex-col items-center justify-start">
        <div className="w-full flex flex-row items-start justify-center" style={{ minHeight: '50vh' }}>
          <ScientificCalculator />
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8 w-full">
          <CalculatorGroups search={search} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
