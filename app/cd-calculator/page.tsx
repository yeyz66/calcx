'use client';
import React, { useState } from 'react';
import Header from '../components/Header';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Chart,
  TooltipItem,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

type CDScheduleRow = {
  year: number;
  balance: number;
  interest: number;
  taxPaid: number;
};

type CDResult = {
  finalBalance: number;
  totalInterest: number;
  totalTax: number;
  schedule: CDScheduleRow[];
};

function calculateCD({ principal, rate, years, compounding, taxRate }: { principal: number; rate: number; years: number; compounding: number; taxRate: number }) {
  const schedule = [];
  let balance = principal;
  let totalInterest = 0;
  let totalTax = 0;
  for (let y = 1; y <= years; y++) {
    let yearInterest = 0;
    for (let p = 0; p < compounding; p++) {
      const interest = balance * (rate / compounding);
      const taxedInterest = interest * (1 - taxRate);
      yearInterest += taxedInterest;
      totalTax += interest * taxRate;
      balance += taxedInterest;
    }
    totalInterest += yearInterest;
    schedule.push({
      year: y,
      balance: balance,
      interest: totalInterest,
      taxPaid: totalTax,
    });
  }
  return {
    finalBalance: balance,
    totalInterest,
    totalTax,
    schedule,
  };
}

const compoundingOptions = [
  { label: 'Annually', value: 1 },
  { label: 'Semiannually', value: 2 },
  { label: 'Quarterly', value: 4 },
  { label: 'Monthly', value: 12 },
  { label: 'Daily', value: 365 },
];

export default function CDCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(0.04);
  const [years, setYears] = useState(5);
  const [compounding, setCompounding] = useState(1);
  const [taxRate, setTaxRate] = useState(0.25);
  const [result, setResult] = useState<CDResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const calc = calculateCD({ principal, rate, years, compounding, taxRate });
    setResult(calc);
    setShowResult(true);
  };

  const pieData = result && {
    labels: ['Total Interest', 'Principal'],
    datasets: [
      {
        data: [result.totalInterest, principal],
        backgroundColor: ['#38bdf8', '#a3e635'],
        hoverOffset: 4,
      },
    ],
  };

  const barData = result && {
    labels: ['Total Interest', 'Final Balance'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [result.totalInterest, result.finalBalance],
        backgroundColor: ['#38bdf8', '#a3e635'],
      },
    ],
  };

  const pieOptions = {
    plugins: {
      datalabels: {
        color: '#222',
        font: { weight: 700, size: 16 },
        formatter: (value: number, context: { chart: Chart }) => {
          const data = context.chart.data.datasets[0].data;
          const total = (Array.isArray(data) ? data.filter((v): v is number => typeof v === 'number') : []).reduce((a, b) => a + b, 0);
          const percent = total ? (value / total) * 100 : 0;
          return percent.toFixed(1) + '%';
        },
      },
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
  };

  const barOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            let label = context.dataset.label ?? '';
            if (label) label += ': ';
            if (context.parsed.y !== null && context.parsed.y !== undefined) {
              label += context.parsed.y.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
            }
            return label;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: number | string) {
            const num = Number(value);
            return isNaN(num) ? value : num.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2">CD Calculator</h1>
        <p className="mb-6 text-gray-600">A Certificate of Deposit (CD) calculator helps you determine the accumulated interest and final balance of your deposit over time. Tax is considered for a more accurate result.</p>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
          <div>
            <label className="block font-medium mb-1">Principal ($)</label>
            <input type="number" min="0" step="100" className="w-full border rounded px-3 py-2" value={principal} onChange={e => setPrincipal(Number(e.target.value))} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Annual Interest Rate (%)</label>
            <input type="number" min="0" max="100" step="0.01" className="w-full border rounded px-3 py-2" value={rate * 100} onChange={e => setRate(Number(e.target.value) / 100)} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Term (years)</label>
            <input type="number" min="1" max="50" step="1" className="w-full border rounded px-3 py-2" value={years} onChange={e => setYears(Number(e.target.value))} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Compounding Frequency</label>
            <select className="w-full border rounded px-3 py-2" value={compounding} onChange={e => setCompounding(Number(e.target.value))}>
              {compoundingOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Tax Rate (%)</label>
            <input type="number" min="0" max="100" step="0.01" className="w-full border rounded px-3 py-2" value={taxRate * 100} onChange={e => setTaxRate(Number(e.target.value) / 100)} required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition">Calculate</button>
        </form>
        {showResult && result && (
          <section className="space-y-8">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-bold mb-2">Results</h2>
              <div className="mb-2">Final Balance: <span className="font-semibold">${result.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
              <div className="mb-2">Total Interest Earned: <span className="font-semibold">${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
              <div className="mb-2">Total Tax Paid: <span className="font-semibold">${result.totalTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-2">Interest vs. Principal (Pie Chart)</h3>
                {pieData && <Pie data={pieData} options={pieOptions} plugins={[ChartDataLabels]} />}
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-2">Interest & Final Balance (Bar Chart)</h3>
                {barData && <Bar data={barData} options={barOptions} />}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
              <h3 className="font-semibold mb-2">Accumulation Schedule</h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-left">Year</th>
                    <th className="px-2 py-1 text-left">End Balance ($)</th>
                    <th className="px-2 py-1 text-left">Total Interest ($)</th>
                    <th className="px-2 py-1 text-left">Total Tax Paid ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((row: CDScheduleRow) => (
                    <tr key={row.year} className="border-b">
                      <td className="px-2 py-1">{row.year}</td>
                      <td className="px-2 py-1">{row.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-2 py-1">{row.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-2 py-1">{row.taxPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
      <section className="max-w-2xl mx-auto p-4 mt-10 mb-8 bg-white rounded-lg shadow space-y-6 text-gray-700">
        <h2 className="text-2xl font-bold mb-2">What is a Certificate of Deposit (CD)?</h2>
        <p>
          In the United States, a Certificate of Deposit (CD) is a popular savings product offered by banks and credit unions. When you open a CD, you agree to deposit a fixed amount of money for a set period—ranging from a few months to several years. In return, the bank pays you a guaranteed interest rate, usually higher than a regular savings account. At the end of the term (maturity), you receive your original deposit plus the interest earned. CDs are a safe way for Americans to grow their savings without risk from market fluctuations.
        </p>
        <h3 className="text-xl font-semibold mt-4 mb-1">FDIC Insurance: Your Money is Protected</h3>
        <p>
          Most CDs in the U.S. are insured by the Federal Deposit Insurance Corporation (FDIC) for banks, or the National Credit Union Administration (NCUA) for credit unions, up to $250,000 per depositor, per institution, per ownership category. This federal insurance means your money is protected even if your bank or credit union fails. Always confirm that your financial institution is FDIC or NCUA insured before opening a CD.
        </p>
        <h3 className="text-xl font-semibold mt-4 mb-1">Where and How to Purchase CDs in the U.S.</h3>
        <p>
          You can purchase CDs at nearly all U.S. banks and credit unions, both traditional and online. Online banks often offer higher rates and easy account opening. To buy a CD in the U.S.:
          <ul className="list-disc list-inside mt-2">
            <li>Compare rates and terms from different U.S. banks and credit unions—look for FDIC or NCUA insurance.</li>
            <li>Choose your deposit amount and the term that fits your savings goals.</li>
            <li>Open the CD account online, in a branch, or by phone, and fund it from your checking or savings account.</li>
            <li>Keep your money in the CD until maturity to avoid early withdrawal penalties, which are common in the U.S.</li>
          </ul>
          Be sure to read all terms and conditions, including how interest is paid, what happens at maturity, and any penalties for early withdrawal. CDs are a great option for U.S. savers who want safety and predictable returns.
        </p>
      </section>
    </div>
  );
} 