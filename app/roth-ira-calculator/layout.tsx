import React from 'react';
import Header from '../components/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
    </div>
  );
} 