import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
        <div className="mb-2 md:mb-0">&copy; {new Date().getFullYear()} <a href="https://calcx.org" className="hover:underline">calcx.org</a>. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-black transition">Privacy Policy</a>
          <a href="#" className="hover:text-black transition">Terms</a>
        </div>
      </div>
    </footer>
  );
} 