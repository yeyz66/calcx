'use client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import React, { useState } from 'react';
import Head from 'next/head';

function calculateBodyFat({ gender, height, neck, waist, hip }: { gender: string; height: number; neck: number; waist: number; hip?: number }) {
  // All measurements in inches
  // 2023 Army standard: https://www.army.mil/acft/
  // Male: %BF = 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
  // Female: %BF = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
  if (gender === 'male') {
    return 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  } else {
    return 163.205 * Math.log10(waist + (hip || 0) - neck) - 97.684 * Math.log10(height) - 78.387;
  }
}

const limits = {
  male: [
    { min: 17, max: 20, limit: 20 },
    { min: 21, max: 27, limit: 22 },
    { min: 28, max: 39, limit: 24 },
    { min: 40, max: 150, limit: 26 },
  ],
  female: [
    { min: 17, max: 20, limit: 30 },
    { min: 21, max: 27, limit: 32 },
    { min: 28, max: 39, limit: 34 },
    { min: 40, max: 150, limit: 36 },
  ],
};

function getLimit(gender: string, age: number) {
  const group = limits[gender as 'male' | 'female'];
  if (!group) return null;
  for (const g of group) {
    if (age >= g.min && age <= g.max) return g.limit;
  }
  return null;
}

export default function AcftCalculatorPage() {
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('70');
  const [neck, setNeck] = useState('16');
  const [waist, setWaist] = useState('34');
  const [hip, setHip] = useState('38');
  const [result, setResult] = useState('');

  function handleCalculate() {
    const h = parseFloat(height);
    const n = parseFloat(neck);
    const w = parseFloat(waist);
    const hp = parseFloat(hip);
    const a = parseInt(age);
    if (isNaN(h) || isNaN(n) || isNaN(w) || isNaN(a) || (gender === 'female' && isNaN(hp))) {
      setResult('Please enter all required values.');
      return;
    }
    const bf = calculateBodyFat({ gender, height: h, neck: n, waist: w, hip: gender === 'female' ? hp : undefined });
    const limit = getLimit(gender, a);
    if (limit === null) {
      setResult('Age out of range.');
      return;
    }
    const pass = bf <= limit;
    setResult(`Body Fat: ${bf.toFixed(1)}% | Limit: ${limit}% | ${pass ? 'PASS' : 'FAIL'}`);
  }

  return (
    <>
      <Head>
        <title>ACFT Calculator - U.S. Army Body Fat Calculator (2023)</title>
        <meta name="description" content="ACFT Calculator - U.S. Army Body Fat Calculator based on the June 12, 2023 standard. Instantly calculate your body fat percentage and compliance with Army standards. U.S. Army Body Composition Program body fat assessment." />
      </Head>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
        <Header search="" setSearch={() => {}} />
        <main className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-md border border-gray-200">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">ACFT Body Fat Calculator (2023)</h1>
            <p className="mb-6 text-gray-700 text-base">Calculate your body fat percentage and pass/fail status for the U.S. Army Body Composition Program (effective June 12, 2023). Enter your measurements in inches.</p>
            <div className="space-y-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-1">Gender</label>
                  <select className="w-full border rounded px-2 py-1" value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 mb-1">Age</label>
                  <input type="number" className="w-full border rounded px-2 py-1" value={age} onChange={e => setAge(e.target.value)} min="17" max="150" />
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-1">Height (inches)</label>
                  <input type="number" className="w-full border rounded px-2 py-1" value={height} onChange={e => setHeight(e.target.value)} min="50" max="90" />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 mb-1">Neck (inches)</label>
                  <input type="number" className="w-full border rounded px-2 py-1" value={neck} onChange={e => setNeck(e.target.value)} min="10" max="30" />
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-1">Waist (inches)</label>
                  <input type="number" className="w-full border rounded px-2 py-1" value={waist} onChange={e => setWaist(e.target.value)} min="20" max="60" />
                </div>
                {gender === 'female' && (
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-1">Hip (inches)</label>
                    <input type="number" className="w-full border rounded px-2 py-1" value={hip} onChange={e => setHip(e.target.value)} min="20" max="70" />
                  </div>
                )}
              </div>
              <button className="w-full bg-black text-white py-2 rounded font-semibold mt-2 hover:bg-gray-800 transition" onClick={handleCalculate}>Calculate</button>
              {result && <div className="mt-4 text-lg font-bold text-green-700">{result}</div>}
            </div>
          </div>
        </main>
        <section className="max-w-md mx-auto bg-white rounded-lg shadow p-6 mt-8 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-900">About the ACFT Calculator &apos; Body Fat Calculation Rules</h2>
          <p className="mb-4 text-gray-700">The <strong>ACFT Calculator</strong> is designed to help U.S. Army personnel and fitness enthusiasts estimate body fat percentage according to the latest Army Body Composition Program (ABCP) standards, effective June 12, 2023. This tool is especially useful for those preparing for the Army Combat Fitness Test (ACFT) or monitoring compliance with military requirements.</p>
          <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Calculation Rules</h3>
          <ul className="list-disc pl-5 mb-4 text-gray-700">
            <li><strong>For males:</strong> % Body Fat = 86.010 × log<sub>10</sub>(waist - neck) - 70.041 × log<sub>10</sub>(height) + 36.76</li>
            <li><strong>For females:</strong> % Body Fat = 163.205 × log<sub>10</sub>(waist + hip - neck) - 97.684 × log<sub>10</sub>(height) - 78.387</li>
            <li>All measurements are in inches.</li>
            <li>Passing limits vary by age and gender, based on official Army tables.</li>
          </ul>
          <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Why This Calculator?</h3>
          <p className="mb-2 text-gray-700">The U.S. Army uses body fat percentage as a key indicator of physical readiness. The <strong>acft calculator</strong> provides a fast, accurate, and user-friendly way to check compliance with Army standards, reducing manual calculation errors and helping users track their progress over time.</p>
          <p className="text-gray-700">Whether you are a service member, recruiter, or fitness coach, this <strong>acft calculator</strong> ensures you have the latest tools to meet the Army&apos;s body composition requirements.</p>
        </section>
        <section className="max-w-md mx-auto bg-white rounded-lg shadow p-6 mt-8 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Maximum Allowable Body Fat Percentage Standards (U.S. Army, 2023)</h3>
          <p className="mb-4 text-gray-700">The following table shows the maximum allowable body fat percentage by age and gender, as used in the <strong>acft calculator</strong> and the official Army Body Composition Program.</p>
          <table className="w-full border text-sm mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Age</th>
                <th className="border px-2 py-1">Male (%)</th>
                <th className="border px-2 py-1">Female (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">17-20</td>
                <td className="border px-2 py-1">20</td>
                <td className="border px-2 py-1">30</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">21-27</td>
                <td className="border px-2 py-1">22</td>
                <td className="border px-2 py-1">32</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">28-39</td>
                <td className="border px-2 py-1">24</td>
                <td className="border px-2 py-1">34</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">40+</td>
                <td className="border px-2 py-1">26</td>
                <td className="border px-2 py-1">36</td>
              </tr>
            </tbody>
          </table>
          <p className="text-gray-700">These standards are enforced during Army assessments and are built into this <strong>acft calculator</strong> for accurate pass/fail results.</p>
        </section>
        <Footer />
      </div>
    </>
  );
} 