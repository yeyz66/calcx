'use client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import React, { useState } from 'react';
import ScientificCalculator from '../components/ScientificCalculator';

export default function ScientificCalculatorPage() {
  const [search, setSearch] = useState('');
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      <Header search={search} setSearch={setSearch} />
      <main className="flex-1">
        <ScientificCalculator />
      </main>
      <Footer />
    </div>
  );
} 