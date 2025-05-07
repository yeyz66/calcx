'use client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import React, { useState } from 'react';

const lengthUnits = [
  { label: 'Meter (m)', value: 'm', factor: 1 },
  { label: 'Feet (ft)', value: 'ft', factor: 0.3048 },
  { label: 'Inch (in)', value: 'in', factor: 0.0254 },
];
const thicknessUnits = [
  { label: 'Inch (in)', value: 'in', factor: 0.0254 },
  { label: 'Meter (m)', value: 'm', factor: 1 },
];
const weightUnits = [
  { label: 'Metric Ton/m³ (t/m³)', value: 't', factor: 1 },
  { label: 'Kilogram/m³ (kg/m³)', value: 'kg', factor: 0.001 },
  { label: 'LB/(SY*INCH)', value: 'lb_sy_in', factor: 0 }, // 需特殊处理
];

function convertLength(val: number, from: string) {
  const unit = lengthUnits.find(u => u.value === from);
  return unit ? val * unit.factor : val;
}
function convertThickness(val: number, from: string) {
  const unit = thicknessUnits.find(u => u.value === from);
  return unit ? val * unit.factor : val;
}

export default function AsphaltCalculatorPage() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [thickness, setThickness] = useState('');
  const [unitWeight, setUnitWeight] = useState('110'); // LB/(SY*INCH)
  const [lengthUnit, setLengthUnit] = useState('ft');
  const [widthUnit, setWidthUnit] = useState('ft');
  const [thicknessUnit, setThicknessUnit] = useState('in');
  const [weightUnit, setWeightUnit] = useState('lb_sy_in');
  const [result, setResult] = useState('');

  function calculate() {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const t = parseFloat(thickness);
    const uw = parseFloat(unitWeight);
    if (isNaN(l) || isNaN(w) || isNaN(t) || isNaN(uw)) {
      setResult('Please enter all values');
      return;
    }
    let tons = 0;
    if (weightUnit === 'lb_sy_in') {
      // 1 SY = 9 ft²
      // 1 ft = 12 in
      // 1 short ton = 2000 LB
      const length_ft = lengthUnit === 'ft' ? l : lengthUnit === 'm' ? l / 0.3048 : l / 12;
      const width_ft = widthUnit === 'ft' ? w : widthUnit === 'm' ? w / 0.3048 : w / 12;
      const thickness_in = thicknessUnit === 'in' ? t : thicknessUnit === 'm' ? t / 0.0254 : t * 12;
      const area_sy = (length_ft * width_ft) / 9;
      const total_lb = area_sy * thickness_in * uw;
      tons = total_lb / 2000;
    } else {
      // SI 体积计算
      const l_m = convertLength(l, lengthUnit);
      const w_m = convertLength(w, widthUnit);
      const t_m = convertThickness(t, thicknessUnit);
      const volume = l_m * w_m * t_m;
      const uw_t = weightUnit === 't' ? uw : uw * 0.001;
      tons = volume * uw_t;
    }
    setResult(tons.toFixed(3) + ' short tons');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      <Header search="" setSearch={() => {}} />
      <main className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md border border-gray-200">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Asphalt Mass Calculator</h1>
          <p className="mb-6 text-gray-700 text-base">Enter the length, width, and thickness of your asphalt pavement, along with the compacted unit weight. Select the appropriate units for each field. Click Calculate to estimate the total amount of asphalt required for your project.</p>
          <div className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-gray-700 mb-1">Length</label>
                <input type="number" className="w-full border rounded px-2 py-1" value={length} onChange={e => setLength(e.target.value)} placeholder="e.g. 100" min="0" />
              </div>
              <select className="border rounded px-2 py-1" value={lengthUnit} onChange={e => setLengthUnit(e.target.value)}>
                {lengthUnits.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-gray-700 mb-1">Width</label>
                <input type="number" className="w-full border rounded px-2 py-1" value={width} onChange={e => setWidth(e.target.value)} placeholder="e.g. 50" min="0" />
              </div>
              <select className="border rounded px-2 py-1" value={widthUnit} onChange={e => setWidthUnit(e.target.value)}>
                {lengthUnits.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-gray-700 mb-1">Thickness</label>
                <input type="number" className="w-full border rounded px-2 py-1" value={thickness} onChange={e => setThickness(e.target.value)} placeholder="e.g. 2" min="0" />
              </div>
              <select className="border rounded px-2 py-1" value={thicknessUnit} onChange={e => setThicknessUnit(e.target.value)}>
                {thicknessUnits.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-gray-700 mb-1 whitespace-nowrap">Compacted Asphalt Pavement Unit Weight</label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <input type="number" className="w-full border rounded px-2 py-1" value={unitWeight} onChange={e => setUnitWeight(e.target.value)} placeholder="e.g. 110" min="0" />
                </div>
                <select className="border rounded px-2 py-1" value={weightUnit} onChange={e => setWeightUnit(e.target.value)}>
                  {weightUnits.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <button className="w-full bg-black text-white py-2 rounded font-semibold mt-2 hover:bg-gray-800 transition" onClick={calculate}>Calculate</button>
            {result && <div className="mt-4 text-lg font-bold text-green-700">{result}</div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 