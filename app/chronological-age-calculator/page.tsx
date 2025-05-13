"use client";

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface AgeResult {
  years: number;
  months: number;
  weeks: number;
  days: number;
  totalDays: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Function to calculate the difference between two dates
function calculateAge(dob: string, targetDate: string): AgeResult | string {
  const startDate = new Date(dob);
  const endDate = new Date(targetDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return "Invalid date input. Please check your dates.";
  }

  if (startDate > endDate) {
    return "Date of Birth cannot be after Age at Date.";
  }

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate();

  // Adjust days and months if days are negative
  if (days < 0) {
    months--;
    // Days in the month previous to endDate's month
    const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  // Adjust months and years if months are negative
  if (months < 0) {
    years--;
    months += 12;
  }

  // Calculate total time difference for totalDays, hours, minutes, seconds
  const diffTime = endDate.getTime() - startDate.getTime();
  const totalSeconds = Math.floor(diffTime / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  // For the Y M D display, years, months, days are already calculated.
  // Now, break down the 'days' component into weeks and remaining days.
  const weeks = Math.floor(days / 7);
  const remainingDaysAfterWeeks = days % 7;

  return {
    years: years,
    months: months,
    weeks: weeks,
    days: remainingDaysAfterWeeks,
    totalDays: totalDays,
    hours: totalHours,
    minutes: totalMinutes,
    seconds: totalSeconds,
  };
}

export default function ChronologicalAgeCalculatorPage() {
  const [dob, setDob] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<AgeResult | string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Function to open date picker when the container is clicked
  const handleDateWrapperClick = (inputId: string) => {
    const dateInput = document.getElementById(inputId) as HTMLInputElement;
    if (dateInput && dateInput.type === 'date') {
      dateInput.showPicker();
    }
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);
    if (!dob) {
        setError("Please enter a Date of Birth.");
        return;
    }
    if (!targetDate) {
        setError("Please enter an Age at Date.");
        return;
    }
    const calculationResult = calculateAge(dob, targetDate);
    if (typeof calculationResult === 'string') {
      setError(calculationResult);
    } else {
      setResult(calculationResult);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      <Header search={search} setSearch={setSearch} />
      <div className="container mx-auto p-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">Chronological Age Calculator</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <div 
              className="relative cursor-pointer date-input-wrapper" 
              data-for="dob"
              onClick={() => handleDateWrapperClick('dob')}
            >
              <input
                type="date"
                id="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer"
                style={{ colorScheme: 'auto' }}
              />
            </div>
          </div>
          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
              Age at Date
            </label>
            <div 
              className="relative cursor-pointer date-input-wrapper"
              data-for="targetDate"
              onClick={() => handleDateWrapperClick('targetDate')}
            >
              <input
                type="date"
                id="targetDate"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer"
                style={{ colorScheme: 'auto' }}
              />
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <button
            onClick={handleCalculate}
            className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Calculate
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {result && typeof result !== 'string' && (
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <div className="space-y-2">
              <p><strong>Years:</strong> {result.years}</p>
              <p><strong>Months:</strong> {result.months}</p>
              <p><strong>Weeks:</strong> {result.weeks}</p>
              <p><strong>Days:</strong> {result.days}</p>
              <hr className="my-2" />
              <p><strong>Total Duration:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>{result.totalDays} days</li>
                <li>{result.hours} hours</li>
                <li>{result.minutes} minutes</li>
                <li>{result.seconds} seconds</li>
              </ul>
            </div>
          </div>
        )}

        <section className="mt-12 prose max-w-none">
          <h2 className="text-2xl font-semibold mb-4">About this Calculator</h2>
          <p>
            This calculator determines the duration between two dates: a "Date of Birth" and an "Age at Date" (which defaults to the current day but can be changed). The result is presented in a detailed format, including years, months, weeks, days, hours, minutes, and seconds.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-2">Calculation Method</h3>
          <p>
            We use the most common age calculation system, where age increments on the anniversary of the birth date. For instance, if someone is born on January 1st, 2000, they are considered 1 year old on January 1st, 2001.
          </p>
          <p>
            This system is common in many Western cultures. It differs from other cultural systems, such as the traditional Chinese method where a baby is considered one year old at birth and gains another year at the start of the Lunar New Year.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-2">Handling End-of-Month Dates</h3>
          <p>
            Calculating months and days can sometimes be ambiguous, especially when dealing with end-of-month dates (e.g., February 28th to March 31st). Our calculator follows a consistent method: for example, February 20th to March 20th is considered one full month. Similarly, February 28th to March 28th is treated as one month, and we then account for the remaining days.
          </p>
          {/* TODO: Add more informational content as needed */}
        </section>
      </div>
      <Footer />
    </div>
  );
} 