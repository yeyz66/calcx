'use client';
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Chart,
  ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import AmortizationTable from './components/AmortizationTable';

ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  PointElement,
  LineElement,
  Tooltip, 
  Legend,
  ChartDataLabels
);

type AmortizationRow = {
  month: number;
  interest: number;
  principal: number;
  balance: number;
  payment: number;
};

type LoanResult = {
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  amortizationSchedule: AmortizationRow[];
};

type TimeToPayoffResult = {
  months: number;
  totalInterest: number;
  totalPayment: number;
  amortizationSchedule: AmortizationRow[];
};

// Function to calculate monthly payment for fixed term
function calculateFixedTerm(principal: number, interestRate: number, years: number): LoanResult {
  const monthlyRate = interestRate / 12;
  const numPayments = years * 12;
  
  // Calculate monthly payment using the loan formula
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  // Generate amortization schedule
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  
  for (let month = 1; month <= numPayments; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    totalInterest += interestPayment;
    
    schedule.push({
      month,
      interest: interestPayment,
      principal: principalPayment,
      balance: balance > 0 ? balance : 0,
      payment: monthlyPayment
    });
  }
  
  return {
    monthlyPayment,
    totalPayments: monthlyPayment * numPayments,
    totalInterest,
    amortizationSchedule: schedule
  };
}

// Function to calculate time to payoff with fixed payment
function calculateFixedPayment(principal: number, interestRate: number, monthlyPayment: number): TimeToPayoffResult | null {
  const monthlyRate = interestRate / 12;
  
  // Check if payment is enough to cover interest
  const minPayment = principal * monthlyRate;
  if (monthlyPayment <= minPayment) {
    return null; // Payment is too low to ever pay off the loan
  }
  
  // Calculate time to payoff
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let month = 0;
  let totalInterest = 0;
  
  while (balance > 0 && month < 1200) { // Cap at 100 years (1200 months) to prevent infinite loops
    month++;
    const interestPayment = balance * monthlyRate;
    let payment = monthlyPayment;
    
    // Last payment might be smaller
    if (balance + interestPayment < monthlyPayment) {
      payment = balance + interestPayment;
    }
    
    const principalPayment = payment - interestPayment;
    balance -= principalPayment;
    totalInterest += interestPayment;
    
    schedule.push({
      month,
      interest: interestPayment,
      principal: principalPayment,
      balance: balance > 0 ? balance : 0,
      payment
    });
    
    if (balance <= 0) break;
  }
  
  return {
    months: month,
    totalInterest,
    totalPayment: totalInterest + principal,
    amortizationSchedule: schedule
  };
}

export default function PaymentCalculator() {
  const [activeTab, setActiveTab] = useState<'fixedTerm' | 'fixedPayment'>('fixedTerm');
  
  // Fixed Term state
  const [loanAmount, setLoanAmount] = useState(200000);
  const [interestRate, setInterestRate] = useState(0.06); // 6%
  const [loanTerm, setLoanTerm] = useState(15); // 15 years
  const [fixedTermResult, setFixedTermResult] = useState<LoanResult | null>(null);
  
  // Fixed Payment state
  const [paymentLoanAmount, setPaymentLoanAmount] = useState(200000);
  const [paymentInterestRate, setPaymentInterestRate] = useState(0.06); // 6%
  const [monthlyPayment, setMonthlyPayment] = useState(2000);
  const [fixedPaymentResult, setFixedPaymentResult] = useState<TimeToPayoffResult | null>(null);
  const [paymentError, setPaymentError] = useState('');
  
  // First, update the state variables for interest rates to track the display value
  const [interestRateDisplay, setInterestRateDisplay] = useState('6');
  const [paymentInterestRateDisplay, setPaymentInterestRateDisplay] = useState('6');
  
  // Calculate fixed term result when inputs change
  useEffect(() => {
    const result = calculateFixedTerm(loanAmount, interestRate, loanTerm);
    setFixedTermResult(result);
  }, [loanAmount, interestRate, loanTerm]);
  
  // Calculate fixed payment result when inputs change
  useEffect(() => {
    const minPayment = paymentLoanAmount * (paymentInterestRate / 12);
    
    if (monthlyPayment <= minPayment) {
      setPaymentError(`Monthly payment must be greater than $${minPayment.toFixed(2)} to reduce the principal.`);
      setFixedPaymentResult(null);
    } else {
      setPaymentError('');
      const result = calculateFixedPayment(paymentLoanAmount, paymentInterestRate, monthlyPayment);
      setFixedPaymentResult(result);
    }
  }, [paymentLoanAmount, paymentInterestRate, monthlyPayment]);
  
  // Prepare chart data for fixed term
  const fixedTermPieData = fixedTermResult && {
    labels: ['Principal', 'Interest'],
    datasets: [
      {
        data: [loanAmount, fixedTermResult.totalInterest],
        backgroundColor: ['#4ade80', '#fb7185'],
        hoverOffset: 4,
      },
    ],
  };
  
  const fixedTermLineData = fixedTermResult && {
    labels: fixedTermResult.amortizationSchedule
      .filter((_, index) => index % 12 === 0)
      .map(row => Math.ceil(row.month / 12).toString()),
    datasets: [
      {
        label: 'Balance',
        data: fixedTermResult.amortizationSchedule
          .filter((_, index) => index % 12 === 0)
          .map(row => row.balance),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Annual Payment',
        data: fixedTermResult.amortizationSchedule
          .filter((_, index) => index % 12 === 0)
          .map(() => fixedTermResult.monthlyPayment * 12),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Annual Interest',
        data: fixedTermResult.amortizationSchedule
          .filter((_, index) => (index + 1) % 12 === 0)
          .map((_, yearIndex) => {
            const yearStartIndex = yearIndex * 12;
            const yearEndIndex = Math.min(yearStartIndex + 12, fixedTermResult.amortizationSchedule.length);
            return fixedTermResult.amortizationSchedule
              .slice(yearStartIndex, yearEndIndex)
              .reduce((sum, row) => sum + row.interest, 0);
          }),
        borderColor: '#f87171',
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        yAxisID: 'y1',
      }
    ],
  };
  
  // Prepare chart data for fixed payment
  const fixedPaymentPieData = fixedPaymentResult && {
    labels: ['Principal', 'Interest'],
    datasets: [
      {
        data: [paymentLoanAmount, fixedPaymentResult.totalInterest],
        backgroundColor: ['#4ade80', '#fb7185'],
        hoverOffset: 4,
      },
    ],
  };
  
  const fixedPaymentLineData = fixedPaymentResult && {
    labels: fixedPaymentResult.amortizationSchedule
      .filter((_, index) => index % 12 === 0 || index === fixedPaymentResult.amortizationSchedule.length - 1)
      .map(row => Math.ceil(row.month / 12).toString()),
    datasets: [
      {
        label: 'Balance',
        data: fixedPaymentResult.amortizationSchedule
          .filter((_, index) => index % 12 === 0 || index === fixedPaymentResult.amortizationSchedule.length - 1)
          .map(row => row.balance),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Annual Payment',
        data: fixedPaymentResult.amortizationSchedule
          .filter((_, index) => index % 12 === 0 || index === fixedPaymentResult.amortizationSchedule.length - 1)
          .map((row, index, filteredArray) => {
            const isLastElement = index === filteredArray.length - 1;
            const isPartialYear = row.month % 12 !== 0;
            
            return isLastElement && isPartialYear
              ? monthlyPayment * (row.month % 12 === 0 ? 12 : row.month % 12)
              : monthlyPayment * 12;
          }),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Annual Interest',
        data: fixedPaymentResult.amortizationSchedule
          .filter((_, index) => (index + 1) % 12 === 0 || index === fixedPaymentResult.amortizationSchedule.length - 1)
          .map((row, index, filteredArray) => {
            if (index === filteredArray.length - 1 && row.month % 12 !== 0) {
              const monthsInLastYear = row.month % 12 || 12;
              const startIndex = fixedPaymentResult.amortizationSchedule.length - monthsInLastYear;
              return fixedPaymentResult.amortizationSchedule
                .slice(startIndex)
                .reduce((sum, r) => sum + r.interest, 0);
            } else {
              const currentYearDataPoints = fixedPaymentResult.amortizationSchedule.filter((_, i) => i % 12 === 0 || i === fixedPaymentResult.amortizationSchedule.length -1);
              const actualMonthForThisPoint = currentYearDataPoints[index].month;
              const yearNumber = Math.floor(actualMonthForThisPoint / 12);

              const yearStartIndex = yearNumber * 12;
              const yearEndIndex = Math.min(yearStartIndex + 12, fixedPaymentResult.amortizationSchedule.length);
              return fixedPaymentResult.amortizationSchedule
                .slice(yearStartIndex, yearEndIndex)
                .reduce((sum, r) => sum + r.interest, 0);
            }
          }),
        borderColor: '#f87171',
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        yAxisID: 'y1',
      }
    ],
  };
  
  // Chart options
  const pieOptions: ChartOptions<'pie'> = {
    plugins: {
      datalabels: {
        display: true,
        color: '#ffffff',
        font: { weight: 'bold' as const, size: 14 },
        formatter: (value: number, context: any) => {
          const data = context.chart.data.datasets[0].data;
          const total = data.reduce((sum: number, val: number) => sum + val, 0);
          const percentage = (value / total) * 100;
          return percentage.toFixed(1) + '%';
        },
        anchor: 'center',
        align: 'center',
        offset: 0
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = (value / total) * 100;
            return `${context.label}: $${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${percentage.toFixed(1)}%)`;
          }
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    layout: {
      padding: 20
    },
    cutout: '0%',  // Change back to a regular pie chart (not a doughnut)
    maintainAspectRatio: false // Added to allow height control
  };
  
  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        ticks: {
          display: false,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Balance / Payment'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        ticks: {
          display: false,
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(248, 113, 113, 0.1)',
        },
        title: {
          display: true,
          text: 'Interest'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: $${context.raw.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        cornerRadius: 4,
      },
      datalabels: {
        display: false,
      },
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          boxWidth: 10,
          font: {
            size: 12
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 0
      },
      line: {
        tension: 0.4 
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2">Payment Calculator</h1>
        <p className="mb-6 text-gray-600">
          Calculate monthly payments, loan terms, and view detailed amortization schedules for various loan types.
        </p>
        
        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'fixedTerm' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('fixedTerm')}
          >
            Fixed Term
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'fixedPayment' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('fixedPayment')}
          >
            Fixed Payments
          </button>
        </div>
        
        {/* Fixed Term Calculator */}
        {activeTab === 'fixedTerm' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Loan Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    className="w-full border rounded px-3 py-2"
                    value={loanAmount}
                    onChange={e => setLoanAmount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full border rounded px-3 py-2"
                    value={interestRateDisplay}
                    onChange={e => {
                      const value = e.target.value;
                      // Allow only numbers and one decimal point
                      if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                        setInterestRateDisplay(value);
                        setInterestRate(Number(value) / 100);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term (years)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="w-full border rounded px-3 py-2"
                    value={loanTerm}
                    onChange={e => setLoanTerm(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
            
            {fixedTermResult && (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-500">Monthly Payment</div>
                      <div className="text-2xl font-bold text-blue-600">${fixedTermResult.monthlyPayment.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-500">Total of {loanTerm * 12} Payments</div>
                      <div className="text-2xl font-bold">${fixedTermResult.totalPayments.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-500">Total Interest</div>
                      <div className="text-2xl font-bold text-rose-500">${fixedTermResult.totalInterest.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-4 h-[350px]">
                    <h3 className="font-semibold mb-2">Principal vs Interest</h3>
                    {fixedTermPieData && (
                      <Pie data={fixedTermPieData} options={pieOptions} />
                    )}
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 h-[350px]">
                    <h3 className="font-semibold mb-2">Balance Over Time</h3>
                    {fixedTermLineData && <Line data={fixedTermLineData} options={lineOptions} />}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
                  <AmortizationTable schedule={fixedTermResult.amortizationSchedule} />
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Fixed Payment Calculator */}
        {activeTab === 'fixedPayment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Loan Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    className="w-full border rounded px-3 py-2"
                    value={paymentLoanAmount}
                    onChange={e => setPaymentLoanAmount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full border rounded px-3 py-2"
                    value={paymentInterestRateDisplay}
                    onChange={e => {
                      const value = e.target.value;
                      // Allow only numbers and one decimal point
                      if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                        setPaymentInterestRateDisplay(value);
                        setPaymentInterestRate(Number(value) / 100);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment ($)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border rounded px-3 py-2"
                    value={monthlyPayment}
                    onChange={e => setMonthlyPayment(Number(e.target.value))}
                  />
                </div>
              </div>
              {paymentError && (
                <div className="mt-4 p-2 text-red-700 bg-red-100 rounded text-sm">
                  {paymentError}
                </div>
              )}
            </div>
            
            {fixedPaymentResult && (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-500">Time to Pay Off</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.floor(fixedPaymentResult.months / 12)} years, {fixedPaymentResult.months % 12} months
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-500">Total Payment</div>
                      <div className="text-2xl font-bold">${fixedPaymentResult.totalPayment.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-500">Total Interest</div>
                      <div className="text-2xl font-bold text-rose-500">${fixedPaymentResult.totalInterest.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-4 h-[350px]">
                    <h3 className="font-semibold mb-2">Principal vs Interest</h3>
                    {fixedPaymentPieData && (
                      <Pie data={fixedPaymentPieData} options={pieOptions} />
                    )}
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 h-[350px]">
                    <h3 className="font-semibold mb-2">Balance Over Time</h3>
                    {fixedPaymentLineData && <Line data={fixedPaymentLineData} options={lineOptions} />}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
                  <AmortizationTable schedule={fixedPaymentResult.amortizationSchedule} />
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Educational Content */}
        <section className="mt-12 space-y-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold">Payment Calculator Guide</h2>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Fixed Term vs. Fixed Payments</h3>
            <p className="mb-4 text-gray-700">
              This calculator offers two approaches to loan calculations:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Fixed Term:</strong> Calculate the monthly payment required to pay off a loan within a specified time period (e.g., 15 or 30 years for mortgages).</li>
              <li><strong>Fixed Payments:</strong> Determine how long it will take to pay off a loan when making a specific monthly payment.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Understanding Interest Rate vs. APR</h3>
            <p className="text-gray-700">
              When evaluating loans, it's important to understand the difference between interest rate and Annual Percentage Rate (APR):
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-2">
              <li><strong>Interest Rate:</strong> The basic cost of borrowing the principal loan amount.</li>
              <li><strong>APR:</strong> A broader measure including the interest rate plus other costs such as broker fees, discount points, and closing costs.</li>
              <li>If there are no additional fees, the interest rate equals the APR.</li>
              <li>For large loans like mortgages, the difference can amount to thousands of dollars.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Variable vs. Fixed Interest Rates</h3>
            <p className="text-gray-700">
              Loans typically offer two interest rate options:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-2">
              <li><strong>Fixed Rate:</strong> The interest rate remains constant throughout the loan term, providing predictable payments.</li>
              <li><strong>Variable Rate:</strong> The interest rate may change over time based on market indices, potentially resulting in payment fluctuations.</li>
              <li>Variable rates often start lower than fixed rates but carry the risk of increasing over time.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Tips for Using This Calculator</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Compare different loan terms to see how they affect total interest paid.</li>
              <li>Consider making extra payments to reduce the loan term and save on interest.</li>
              <li>Use the amortization schedule to understand how payments are applied to principal and interest over time.</li>
              <li>For mortgages, remember to account for property taxes and insurance which may be additional to the calculated payment.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
} 