'use client';
import React, { useState } from 'react';
import Head from 'next/head';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Result {
  balance: number;
  principal: number;
  interest: number;
  tax: number;
}

function getYearlyBalancesRothIRA(initial: number, annual: number, rate: number, years: number) {
  let balance = initial;
  const data = [balance];
  for (let i = 0; i < years; i++) {
    balance = (balance + annual) * (1 + rate);
    data.push(balance);
  }
  return data;
}

function getYearlyBalancesTaxable(initial: number, annual: number, rate: number, years: number, taxRate: number) {
  let balance = initial;
  const data = [balance];
  for (let i = 0; i < years; i++) {
    const gain = (balance + annual) * rate;
    const taxedGain = gain * (1 - taxRate);
    balance = balance + annual + taxedGain;
    data.push(balance);
  }
  return data;
}

const calculateRothIRA = (
  initial: number,
  annual: number,
  rate: number,
  years: number
) => {
  let balance = initial;
  let principal = initial;
  for (let i = 0; i < years; i++) {
    balance = (balance + annual) * (1 + rate);
    principal += annual;
  }
  return {
    balance,
    principal,
    interest: balance - principal,
    tax: 0,
  };
};

const calculateTaxable = (
  initial: number,
  annual: number,
  rate: number,
  years: number,
  taxRate: number
) => {
  let balance = initial;
  let principal = initial;
  let totalTax = 0;
  for (let i = 0; i < years; i++) {
    const gain = (balance + annual) * rate;
    const taxedGain = gain * (1 - taxRate);
    totalTax += gain * taxRate;
    balance = balance + annual + taxedGain;
    principal += annual;
  }
  return {
    balance,
    principal,
    interest: balance - principal,
    tax: totalTax,
  };
};

interface ScheduleRow {
  age: number;
  startPrincipal: number;
  endPrincipal: number;
  startRoth: number;
  endRoth: number;
  startTaxable: number;
  endTaxable: number;
}

function getYearlySchedule(
  initial: number,
  annual: number,
  rate: number,
  years: number,
  taxRate: number,
  currentAge: number
) {
  let rothBalance = initial;
  let taxableBalance = initial;
  let principal = initial;
  const schedule = [];
  for (let i = 0; i < years; i++) {
    const age = currentAge + i;
    // Start values
    const startPrincipal = principal;
    const startRoth = rothBalance;
    const startTaxable = taxableBalance;
    // End of year calculation
    rothBalance = (rothBalance + annual) * (1 + rate);
    const gain = (taxableBalance + annual) * rate;
    const taxedGain = gain * (1 - taxRate);
    taxableBalance = taxableBalance + annual + taxedGain;
    principal += annual;
    schedule.push({
      age,
      startPrincipal,
      endPrincipal: principal,
      startRoth,
      endRoth: rothBalance,
      startTaxable,
      endTaxable: taxableBalance,
    });
  }
  return schedule;
}

export default function RothIRACalculator() {
  const [initial, setInitial] = useState<number>(10000);
  const [annual, setAnnual] = useState<number>(6000);
  const [rate, setRate] = useState<number>(0.07);
  const [currentAge, setCurrentAge] = useState<number>(35);
  const [retireAge, setRetireAge] = useState<number>(65);
  const [taxRate, setTaxRate] = useState<number>(0.25);
  const [showResult, setShowResult] = useState(false);
  const [rothResult, setRothResult] = useState<Result | null>(null);
  const [taxableResult, setTaxableResult] = useState<Result | null>(null);
  const [rothYearly, setRothYearly] = useState<number[]>([]);
  const [taxableYearly, setTaxableYearly] = useState<number[]>([]);
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const years = retireAge - currentAge;

  const handleCalculate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const roth = calculateRothIRA(initial, annual, rate, years);
    const taxable = calculateTaxable(initial, annual, rate, years, taxRate);
    setRothResult(roth);
    setTaxableResult(taxable);
    setRothYearly(getYearlyBalancesRothIRA(initial, annual, rate, years));
    setTaxableYearly(getYearlyBalancesTaxable(initial, annual, rate, years, taxRate));
    setSchedule(getYearlySchedule(initial, annual, rate, years, taxRate, currentAge));
    setShowResult(true);
  };

  const chartData = {
    labels: Array.from({ length: years + 1 }, (_, i) => currentAge + i),
    datasets: [
      {
        label: 'Roth IRA',
        data: rothYearly,
        borderColor: 'rgb(34,197,94)',
        backgroundColor: 'rgba(34,197,94,0.2)',
        tension: 0.2,
        pointRadius: 0,
      },
      {
        label: 'Taxable Account',
        data: taxableYearly,
        borderColor: 'rgb(59,130,246)',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Yearly Balance Comparison',
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '$' + context.parsed.y.toLocaleString(undefined, {maximumFractionDigits: 2});
            }
            return label;
          },
          title: function(context: TooltipItem<'line'>[]) {
            // context is an array of tooltip items
            if (context && context.length > 0) {
              return 'Age: ' + context[0].label;
            }
            return '';
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Balance ($)'
        },
        beginAtZero: true,
      },
    },
    hover: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Head>
        <title>Roth IRA Calculator | Roth IRA vs Taxable Account</title>
        <meta name="description" content="Use this Roth IRA calculator to estimate your Roth IRA savings and compare it to a regular taxable account. Find out how much you can save for retirement!" />
      </Head>
      <h1 className="text-4xl font-extrabold mb-6">Roth IRA Calculator</h1>
      <p className="mb-8 text-lg">Estimate your <span className="text-red-600 font-semibold">Roth IRA</span> savings and compare with a regular <span className="text-red-600 font-semibold">taxable account</span>.</p>
      <form className="grid gap-4 mb-6" onSubmit={handleCalculate}>
        <label>
          Initial Investment ($):
          <input type="number" value={initial} onChange={e => setInitial(Number(e.target.value))} className="ml-2 border p-1 rounded" />
        </label>
        <label>
          Annual Contribution ($):
          <input type="number" value={annual} onChange={e => setAnnual(Number(e.target.value))} className="ml-2 border p-1 rounded" />
        </label>
        <label>
          Annual Return Rate (%):
          <input type="number" step="0.01" value={(rate * 100).toFixed(2)} onChange={e => setRate(Number(e.target.value) / 100)} className="ml-2 border p-1 rounded" />
        </label>
        <label>
          Current Age:
          <input type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} className="ml-2 border p-1 rounded" />
        </label>
        <label>
          Retirement Age:
          <input type="number" value={retireAge} onChange={e => setRetireAge(Number(e.target.value))} className="ml-2 border p-1 rounded" />
        </label>
        <label>
          Tax Rate on Gains (for taxable account) (%):
          <input type="number" value={taxRate * 100} onChange={e => setTaxRate(Number(e.target.value) / 100)} className="ml-2 border p-1 rounded" />
        </label>
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Calculate</button>
      </form>
      {showResult && rothResult && taxableResult && (
        <>
          <div className="mb-8">
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h2 className="text-2xl font-bold mb-4">Comparison Table (at age {retireAge})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 bg-white">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Account Type</th>
                    <th className="border px-4 py-2">Balance at age {retireAge}</th>
                    <th className="border px-4 py-2">Total principal</th>
                    <th className="border px-4 py-2">Total interest</th>
                    <th className="border px-4 py-2">Total tax</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Roth IRA</td>
                    <td className="border px-4 py-2">${rothResult.balance.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="border px-4 py-2">${rothResult.principal.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="border px-4 py-2">${rothResult.interest.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="border px-4 py-2">$0</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Taxable Account</td>
                    <td className="border px-4 py-2">${taxableResult.balance.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="border px-4 py-2">${taxableResult.principal.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="border px-4 py-2">${taxableResult.interest.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="border px-4 py-2">${taxableResult.tax.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="mb-4 text-lg text-green-700 font-semibold">
            According to your input, after {years} years (retirement at age {retireAge}), the <span className="text-red-600 font-semibold">Roth IRA</span> account will have
            <span className="font-bold"> ${ (rothResult.balance - taxableResult.balance).toLocaleString(undefined, {maximumFractionDigits: 2}) } </span>
            more than the <span className="text-red-600 font-semibold">taxable account</span>.
          </div>
        </>
      )}
      {showResult && schedule.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">Annual Schedule</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 bg-white text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1" rowSpan={2}>Age</th>
                  <th className="border px-2 py-1" colSpan={2}>Principal</th>
                  <th className="border px-2 py-1" colSpan={2}>Roth IRA</th>
                  <th className="border px-2 py-1" colSpan={2}>Taxable Account</th>
                </tr>
                <tr>
                  <th className="border px-2 py-1">Start</th>
                  <th className="border px-2 py-1">End</th>
                  <th className="border px-2 py-1">Start</th>
                  <th className="border px-2 py-1">End</th>
                  <th className="border px-2 py-1">Start</th>
                  <th className="border px-2 py-1">End</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row: ScheduleRow) => (
                  <tr key={row.age}>
                    <td className="border px-2 py-1">{row.age}</td>
                    <td className="border px-2 py-1">${row.startPrincipal.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="border px-2 py-1">${row.endPrincipal.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="border px-2 py-1">${row.startRoth.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="border px-2 py-1">${row.endRoth.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="border px-2 py-1">${row.startTaxable.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="border px-2 py-1">${row.endTaxable.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="text-sm text-gray-600">
        <p>This calculator assumes annual contributions at year-end and taxes are paid yearly on gains in the taxable account. Actual results may vary.</p>
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3">Parameter Explanations</h3>
          <div className="space-y-3 mb-2 text-base">
            <p><b className="text-red-600">Initial Investment:</b> The amount of money you invest at the start (the age you begin investing).</p>
            <p><b className="text-red-600">Annual Contribution:</b> The amount you add to your account every year until retirement. This is the money you save or invest each year, in addition to your initial investment. For <span className="text-red-600 font-semibold">Roth IRAs</span>, the IRS sets annual contribution limits, which may change over time and can depend on your income and tax filing status. Be sure to check the latest IRS rules to ensure your planned contributions are within the allowed limits.</p>
            <p><b className="text-red-600">Annual Return Rate:</b> The expected average yearly growth rate of your investments, after fees, expressed as a percentage.</p>
            <p><b className="text-red-600">Current Age:</b> Your age when you start investing.</p>
            <p><b className="text-red-600">Retirement Age:</b> The age at which you plan to retire and stop making annual contributions.</p>
            <p><b className="text-red-600">Tax Rate on Gains:</b> The percentage of investment gains paid as tax each year in a regular <span className="text-red-600 font-semibold">taxable account</span>. <span className="text-red-600 font-semibold">Roth IRA</span> gains are tax-free if qualified.</p>
          </div>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li><b className="text-red-600">Roth IRA</b>: A retirement account where contributions are made with after-tax dollars and qualified withdrawals are tax-free.</li>
            <li><b className="text-red-600">Taxable Account</b>: A regular investment account where you pay taxes on investment gains each year.</li>
            <li>All calculations assume contributions are made at the end of each year and taxes on gains are paid annually for the <span className="text-red-600 font-semibold">taxable account</span>.</li>
            <li>Actual investment returns may vary and are not guaranteed.</li>
          </ul>
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-3">Roth IRA Distribution Details</h3>
            <div className="space-y-2">
              <p><b>Qualified Distributions:</b> Withdrawals from a Roth IRA are tax-free and penalty-free if you are at least age 59½ and your account has been open for at least 5 years.</p>
              <p><b>Non-Qualified Distributions:</b> If you withdraw earnings before age 59½ or before the account is 5 years old, you may owe income tax and a 10% early withdrawal penalty on the earnings portion.</p>
              <p><b>Contributions vs. Earnings:</b> You can always withdraw your original contributions (but not earnings) from a Roth IRA at any time, tax- and penalty-free.</p>
              <p><b>Required Minimum Distributions (RMDs):</b> Roth IRAs are not subject to RMDs during the account owner&apos;s lifetime.</p>
              <p>For more details and the latest rules, consult the <a href="https://www.irs.gov/retirement-plans/roth-iras" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">IRS Roth IRA page</a>.</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-3">Roth IRA Pros and Cons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-1 text-lg">Pros</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Tax-free growth and qualified withdrawals.</li>
                  <li>No required minimum distributions (RMDs) during your lifetime.</li>
                  <li>Contributions (but not earnings) can be withdrawn at any time, tax- and penalty-free.</li>
                  <li>Ideal for those who expect to be in a higher tax bracket in retirement.</li>
                  <li>Can be used as an estate planning tool, as heirs can inherit Roth IRAs tax-free (with some conditions).</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-lg">Cons</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Contributions are not tax-deductible.</li>
                  <li>Annual contribution limits are relatively low and may be further limited by income.</li>
                  <li>High earners may not be eligible to contribute directly to a Roth IRA.</li>
                  <li>Qualified withdrawals require the account to be open for at least 5 years and the account holder to be at least 59½.</li>
                  <li>Potential for legislative changes affecting future tax treatment.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 