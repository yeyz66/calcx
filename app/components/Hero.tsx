import React from 'react';

export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-r from-gray-50 to-white py-16 md:py-24 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">All-in-One Calculator Hub</h1>
        <p className="text-lg md:text-2xl text-gray-600 mb-8">Powerful, precise, and beautifully designed calculators for every need. Explore scientific, financial, health, and more—all in one place.</p>
        <a href="#calculators" className="inline-block bg-black text-white px-8 py-3 rounded-full text-lg font-semibold shadow hover:bg-gray-900 transition">Explore Calculators</a>
      </div>
    </section>
  );
} 