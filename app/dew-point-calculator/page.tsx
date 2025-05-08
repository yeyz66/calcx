'use client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import React, { useState } from 'react';

function calculateDewPoint(temp: number, rh: number): number {
  // Magnus formula (approximation)
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(rh / 100);
  return (b * alpha) / (a - alpha);
}

function calculateHumidity(temp: number, dew: number): number {
  // Inverse Magnus formula
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * dew) / (b + dew));
  const rh = 100 * Math.exp(alpha - ((a * temp) / (b + temp)));
  return rh;
}

function calculateTemperature(dew: number, rh: number): number {
  // Rearranged Magnus formula to solve for temperature
  const a = 17.27;
  const b = 237.7;
  const alpha = Math.log(rh / 100) + ((a * dew) / (b + dew));
  return (b * alpha) / (a - alpha);
}

const tempUnits = [
  { label: 'Celsius (°C)', value: 'C' },
  { label: 'Fahrenheit (°F)', value: 'F' },
  { label: 'Kelvin (K)', value: 'K' },
];

function toCelsius(value: number, unit: string): number {
  if (unit === 'C') return value;
  if (unit === 'F') return (value - 32) * 5 / 9;
  if (unit === 'K') return value - 273.15;
  return value;
}

function fromCelsius(value: number, unit: string): number {
  if (unit === 'C') return value;
  if (unit === 'F') return value * 9 / 5 + 32;
  if (unit === 'K') return value + 273.15;
  return value;
}

export default function DewPointCalculatorPage() {
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [dewPoint, setDewPoint] = useState('');
  const [tempUnit, setTempUnit] = useState('F');
  const [dewUnit, setDewUnit] = useState('F');
  const [result, setResult] = useState<React.ReactNode>(null);

  function formatTemperatureResults(valueC: number, label: string) {
    return (
      <div className="mt-4 text-lg font-bold text-green-700">
        {label}:<br />
        {fromCelsius(valueC, 'C').toFixed(2)} °C &nbsp;|&nbsp; {fromCelsius(valueC, 'F').toFixed(2)} °F &nbsp;|&nbsp; {fromCelsius(valueC, 'K').toFixed(2)} K
      </div>
    );
  }

  function handleCalculate() {
    const temp = temperature !== '' ? toCelsius(parseFloat(temperature), tempUnit) : null;
    const rh = humidity !== '' ? parseFloat(humidity) : null;
    const dew = dewPoint !== '' ? toCelsius(parseFloat(dewPoint), dewUnit) : null;
    let count = 0;
    if (temp !== null) count++;
    if (rh !== null) count++;
    if (dew !== null) count++;
    if (count !== 2) {
      setResult('Please enter exactly two values to calculate the third.');
      return;
    }
    if (temp !== null && rh !== null) {
      if (rh <= 0 || rh > 100) {
        setResult('Relative humidity must be between 1 and 100%.');
        return;
      }
      const dewResultC = calculateDewPoint(temp, rh);
      setDewPoint('');
      setResult(formatTemperatureResults(dewResultC, 'Dew Point Temperature'));
    } else if (temp !== null && dew !== null) {
      const rhResult = calculateHumidity(temp, dew);
      if (rhResult <= 0 || rhResult > 100) {
        setResult('Calculated relative humidity is out of valid range (1-100%).');
        return;
      }
      setHumidity(rhResult.toFixed(2));
      setResult(`Relative Humidity: ${rhResult.toFixed(2)} %`);
    } else if (dew !== null && rh !== null) {
      if (rh <= 0 || rh > 100) {
        setResult('Relative humidity must be between 1 and 100%.');
        return;
      }
      const tempResultC = calculateTemperature(dew, rh);
      setTemperature('');
      setResult(formatTemperatureResults(tempResultC, 'Air Temperature'));
    }
  }

  function handleInputChange(setter: (val: string) => void, value: string) {
    setter(value);
    setResult(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-100">
      <Header search="" setSearch={() => {}} />
      <main className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md border border-gray-200">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Dew Point Calculator</h1>
          <p className="mb-6 text-gray-700 text-base">Enter any two values below to calculate the third. The dew point is the temperature to which air must be cooled to become saturated with water vapor and form dew.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Air Temperature</label>
              <div className="flex gap-2">
                <input type="number" className="w-full border rounded px-2 py-1" value={temperature} onChange={e => handleInputChange(setTemperature, e.target.value)} placeholder="e.g. 77" />
                <select className="border rounded px-2 py-1" value={tempUnit} onChange={e => setTempUnit(e.target.value)}>
                  {tempUnits.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Relative Humidity (%)</label>
              <input type="number" className="w-full border rounded px-2 py-1" value={humidity} onChange={e => handleInputChange(setHumidity, e.target.value)} placeholder="e.g. 60" min="1" max="100" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Dew Point Temperature</label>
              <div className="flex gap-2">
                <input type="number" className="w-full border rounded px-2 py-1" value={dewPoint} onChange={e => handleInputChange(setDewPoint, e.target.value)} placeholder="e.g. 60" />
                <select className="border rounded px-2 py-1" value={dewUnit} onChange={e => setDewUnit(e.target.value)}>
                  {tempUnits.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold mt-2 hover:bg-blue-700 transition" onClick={handleCalculate}>Calculate</button>
            {result && <div>{result}</div>}
          </div>
        </div>
        <article className="mt-10 max-w-2xl bg-white/80 rounded-lg shadow p-6 border border-gray-200 text-gray-800">
          <h2 className="text-xl font-bold mb-2">What is Dew Point?</h2>
          <p className="mb-2">The <strong>dew point</strong> is the temperature at which air becomes saturated with moisture and water vapor begins to condense into liquid water (dew). It is a direct measure of atmospheric moisture. The higher the dew point, the more humid the air feels.</p>
          <h3 className="text-lg font-semibold mt-4 mb-1">Dew Point, Humidity, and Comfort</h3>
          <p className="mb-2">Relative humidity is the percentage of moisture in the air compared to the maximum amount the air can hold at that temperature. When air cools to its dew point, it can no longer hold all its moisture, resulting in condensation. Dew point is a more absolute measure of moisture than relative humidity and is often used to describe comfort levels:</p>
          <ul className="list-disc pl-6 mb-2">
            <li>Dew point below 10°C (50°F): Dry and comfortable</li>
            <li>Dew point 10–16°C (50–60°F): Comfortable</li>
            <li>Dew point 16–18°C (60–65°F): Becoming humid</li>
            <li>Dew point 18–21°C (65–70°F): Humid and uncomfortable</li>
            <li>Dew point above 21°C (70°F): Very humid, oppressive</li>
          </ul>
          <h3 className="text-lg font-semibold mt-4 mb-1">Why is Dew Point Important?</h3>
          <p className="mb-2">Knowing the dew point helps in weather forecasting, HVAC design, agriculture, and understanding personal comfort. It is also crucial for preventing condensation and mold growth indoors.</p>
        </article>
      </main>
      <Footer />
    </div>
  );
} 