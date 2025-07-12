"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface EraConversion {
  inputYear: number;
  inputEra: string;
  conversions: {
    ce: string;
    bce: string;
    hijri: string;
    hebrew: string;
    buddhist: string;
    japanese: string;
  };
}

function convertToEras(year: number, era: string): EraConversion['conversions'] {
  let ceYear: number;
  
  // Convert input to CE year first
  switch (era.toLowerCase()) {
    case 'ce':
    case 'ad':
      ceYear = year;
      break;
    case 'bce':
    case 'bc':
      ceYear = 1 - year; // BCE 1 = CE 1, BCE 2 = CE 0, etc.
      break;
    case 'hijri':
    case 'ah':
      // Approximate conversion: Hijri year 1 = CE 622
      ceYear = Math.round(622 + (year - 1) * 0.970224);
      break;
    case 'hebrew':
    case 'am':
      // Hebrew calendar starts at 3761 BCE
      ceYear = year - 3760;
      break;
    case 'buddhist':
    case 'be':
      // Buddhist era starts 543 years before CE
      ceYear = year - 543;
      break;
    default:
      ceYear = year;
  }

  // Convert CE year to all other eras
  return {
    ce: ceYear > 0 ? `${ceYear} CE` : `${Math.abs(ceYear - 1)} BCE`,
    bce: ceYear > 0 ? `${ceYear} CE` : `${Math.abs(ceYear - 1)} BCE`,
    hijri: ceYear >= 622 ? `${Math.round((ceYear - 622) / 0.970224) + 1} AH` : 'N/A (Before Hijri era)',
    hebrew: `${ceYear + 3760} AM`,
    buddhist: ceYear >= -542 ? `${ceYear + 543} BE` : 'N/A (Before Buddhist era)',
    japanese: getJapaneseEra(ceYear)
  };
}

function getJapaneseEra(ceYear: number): string {
  // Simplified Japanese era conversion (Reiwa era started in 2019)
  if (ceYear >= 2019) {
    return `Reiwa ${ceYear - 2018}`;
  } else if (ceYear >= 1989) {
    return `Heisei ${ceYear - 1988}`;
  } else if (ceYear >= 1926) {
    return `Showa ${ceYear - 1925}`;
  } else if (ceYear >= 1912) {
    return `Taisho ${ceYear - 1911}`;
  } else if (ceYear >= 1868) {
    return `Meiji ${ceYear - 1867}`;
  } else {
    return 'Before modern Japanese era system';
  }
}

export default function EraCalculatorPage() {
  const [inputYear, setInputYear] = useState<string>('');
  const [inputEra, setInputEra] = useState<string>('ce');
  const [result, setResult] = useState<EraConversion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    if (!inputYear.trim()) {
      setError("Please enter a year.");
      return;
    }

    const year = parseInt(inputYear);
    if (isNaN(year) || year <= 0) {
      setError("Please enter a valid positive year.");
      return;
    }

    if (year > 10000) {
      setError("Year must be 10000 or less for accurate calculations.");
      return;
    }

    try {
      const conversions = convertToEras(year, inputEra);
      setResult({
        inputYear: year,
        inputEra: inputEra.toUpperCase(),
        conversions
      });
    } catch (err) {
      setError("An error occurred during calculation. Please try again.");
    }
  };

  const handleReset = () => {
    setInputYear('');
    setInputEra('ce');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      <Header search={search} setSearch={setSearch} />
      <div className="container mx-auto p-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">Era Calculator</h1>
          <p className="text-gray-600 mt-2">Convert years between different calendar systems and historical eras</p>
        </header>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  id="year"
                  value={inputYear}
                  onChange={(e) => setInputYear(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter year (e.g., 2024)"
                  min="1"
                  max="10000"
                />
              </div>
              <div>
                <label htmlFor="era" className="block text-sm font-medium text-gray-700 mb-1">
                  Era/Calendar System
                </label>
                <select
                  id="era"
                  value={inputEra}
                  onChange={(e) => setInputEra(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="ce">CE (Common Era) / AD</option>
                  <option value="bce">BCE (Before Common Era) / BC</option>
                  <option value="hijri">Hijri (Islamic Calendar) / AH</option>
                  <option value="hebrew">Hebrew Calendar / AM</option>
                  <option value="buddhist">Buddhist Calendar / BE</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleCalculate}
                className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Convert
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {result && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">Era Conversions</h2>
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-blue-700">
                  <strong>Input:</strong> {result.inputYear} {result.inputEra}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900">Common Era</div>
                    <div className="text-gray-600">{result.conversions.ce}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900">Hijri Calendar</div>
                    <div className="text-gray-600">{result.conversions.hijri}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900">Hebrew Calendar</div>
                    <div className="text-gray-600">{result.conversions.hebrew}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900">Buddhist Calendar</div>
                    <div className="text-gray-600">{result.conversions.buddhist}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900">Japanese Era</div>
                    <div className="text-gray-600">{result.conversions.japanese}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">About Era Calculator</h2>
            <div className="prose max-w-none">
              <p className="mb-4">
                This era calculator helps you convert years between different calendar systems and historical eras used around the world. Each calendar system has its own starting point and counting method.
              </p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Supported Calendar Systems:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li><strong>CE/AD (Common Era/Anno Domini):</strong> The most widely used calendar system in the world</li>
                <li><strong>BCE/BC (Before Common Era/Before Christ):</strong> Years before the Common Era</li>
                <li><strong>Hijri/AH (Islamic Calendar):</strong> Starts from the year of Prophet Muhammad's migration to Medina (622 CE)</li>
                <li><strong>Hebrew/AM (Jewish Calendar):</strong> Traditional Jewish calendar starting from the creation of the world</li>
                <li><strong>Buddhist/BE (Buddhist Calendar):</strong> Starts from the death of Buddha (543 BCE)</li>
                <li><strong>Japanese Era System:</strong> Based on imperial reigns (Reiwa, Heisei, Showa, etc.)</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">Important Notes:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Conversions are approximate, especially for lunar calendars like Hijri</li>
                <li>Historical dates may vary due to calendar reforms and regional differences</li>
                <li>The calculator uses simplified conversion formulas for educational purposes</li>
                <li>For precise historical or religious calculations, consult specialized sources</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}