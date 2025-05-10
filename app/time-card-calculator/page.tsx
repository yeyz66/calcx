'use client';
import { useState } from 'react';
import TimeCardCalculator from './components/TimeCardCalculator';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TimeCardCalculatorPage() {
  const [search, setSearch] = useState('');
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      <Header search={search} setSearch={setSearch} />
      <main className="flex-1">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4 text-center">Time Card Calculator</h1>
          <TimeCardCalculator />
        </div>
        
        <div className="container mx-auto p-4 mt-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Understanding Time Card Concepts</h2>
          <div className="space-y-4 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800">Regular Hours</h3>
              <p>The standard number of hours an employee is scheduled to work, typically 40 hours per week in many regions. This forms the baseline for calculating pay.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Overtime Hours</h3>
              <p>Any hours worked beyond the defined regular hours. Overtime is often compensated at a higher pay rate (e.g., 1.5 times the regular rate, also known as "time and a half").</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Time In / Time Out</h3>
              <p>The exact times an employee starts (Time In) and stops (Time Out) their work shifts. Accurate recording of these times is crucial for calculating total hours worked.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Breaks</h3>
              <p>Periods during the workday when an employee is not working. Depending on local labor laws and company policy, breaks can be paid or unpaid. Unpaid breaks are typically deducted from the total hours worked.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Total Hours Worked</h3>
              <p>The sum of all hours an employee has spent working, after deducting any unpaid breaks. This figure is used to calculate gross pay.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Pay Rate</h3>
              <p>The amount of compensation an employee receives for each hour of regular work.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Overtime Rate</h3>
              <p>The increased rate of pay for hours worked in overtime. This is often legally mandated and is typically a multiple of the regular pay rate (e.g., 1.5x or 2x).</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 