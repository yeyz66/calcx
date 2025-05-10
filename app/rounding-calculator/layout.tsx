'use client';
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RoundingCalculatorLayout({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState('');
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      <Header search={search} setSearch={setSearch} />
      {children}
      <Footer />
    </div>
  );
} 