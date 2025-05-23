'use client';
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import LoanAmortizationTable from './components/LoanAmortizationTable';

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
  payment: number;
  interest: number;
  principal: number;
  balance: number;
  paymentNumber: number;
};

type LoanResult = {
  payment: number;
  totalPayments: number;
  totalInterest: number;
  amortizationSchedule: AmortizationRow[];
};

// Function to calculate regular amortization (P&I)
function calculateAmortization(principal: number, interestRate: number, years: number, paymentsPerYear: number): LoanResult {
  const periodicRate = interestRate / paymentsPerYear;
  const totalPayments = years * paymentsPerYear;
  
  // Calculate payment using the loan formula
  const payment = principal * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) / (Math.pow(1 + periodicRate, totalPayments) - 1);
  
  // Generate amortization schedule
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  
  for (let paymentNumber = 1; paymentNumber <= totalPayments; paymentNumber++) {
    const interestPayment = balance * periodicRate;
    const principalPayment = payment - interestPayment;
    balance -= principalPayment;
    totalInterest += interestPayment;
    
    schedule.push({
      paymentNumber,
      interest: interestPayment,
      principal: principalPayment,
      balance: balance > 0 ? balance : 0,
      payment: payment
    });
  }
  
  return {
    payment,
    totalPayments: payment * totalPayments,
    totalInterest,
    amortizationSchedule: schedule
  };
}

// Function to calculate fixed principal payments (P+I)
function calculateFixedPrincipal(principal: number, interestRate: number, years: number, paymentsPerYear: number): LoanResult {
  const periodicRate = interestRate / paymentsPerYear;
  const totalPayments = years * paymentsPerYear;
  const fixedPrincipal = principal / totalPayments;
  
  // Generate amortization schedule
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPaymentAmount = 0;
  
  for (let paymentNumber = 1; paymentNumber <= totalPayments; paymentNumber++) {
    const interestPayment = balance * periodicRate;
    const payment = fixedPrincipal + interestPayment;
    balance -= fixedPrincipal;
    totalInterest += interestPayment;
    totalPaymentAmount += payment;
    
    schedule.push({
      paymentNumber,
      interest: interestPayment,
      principal: fixedPrincipal,
      balance: balance > 0 ? balance : 0,
      payment: payment
    });
  }
  
  // Average payment for display purposes
  const averagePayment = totalPaymentAmount / totalPayments;
  
  return {
    payment: averagePayment,
    totalPayments: totalPaymentAmount,
    totalInterest,
    amortizationSchedule: schedule
  };
}

export default function LandLoanCalculator() {
  // Inputs
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(0.055); // 5.5%
  const [loanTerm, setLoanTerm] = useState(30); // 30 years
  const [paymentFrequency, setPaymentFrequency] = useState(12); // Monthly
  const [paymentType, setPaymentType] = useState<'amortization' | 'fixedPrincipal'>('amortization');
  const [interestRateDisplay, setInterestRateDisplay] = useState('5.5');
  
  // Results
  const [loanResult, setLoanResult] = useState<LoanResult | null>(null);
  
  // Calculate loan result when inputs change
  useEffect(() => {
    let result;
    if (paymentType === 'amortization') {
      result = calculateAmortization(loanAmount, interestRate, loanTerm, paymentFrequency);
    } else {
      result = calculateFixedPrincipal(loanAmount, interestRate, loanTerm, paymentFrequency);
    }
    setLoanResult(result);
  }, [loanAmount, interestRate, loanTerm, paymentFrequency, paymentType]);
  
  // Format payment frequency label
  const getPaymentFrequencyLabel = () => {
    switch (paymentFrequency) {
      case 1: return 'annually';
      case 2: return 'semi-annually';
      case 4: return 'quarterly';
      case 12: return 'monthly';
      case 26: return 'bi-weekly';
      case 52: return 'weekly';
      default: return 'monthly';
    }
  };

  // Format payment frequency name
  const getPaymentFrequencyName = () => {
    switch (paymentFrequency) {
      case 1: return 'Annual';
      case 2: return 'Semi-Annual';
      case 4: return 'Quarterly';
      case 12: return 'Monthly';
      case 26: return 'Bi-Weekly';
      case 52: return 'Weekly';
      default: return 'Monthly';
    }
  };
  
  // Prepare chart data
  const pieData = loanResult && {
    labels: ['Principal', 'Interest'],
    datasets: [
      {
        data: [loanAmount, loanResult.totalInterest],
        backgroundColor: ['#4ade80', '#fb7185'],
        hoverOffset: 4,
      },
    ],
  };
  
  // Handle print function
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Land Loan Calculator</h1>
        
        <p className="mb-6 text-gray-700">
          This calculator helps farmers, ranchers, and rural property buyers estimate their land loan payments. 
          Enter your loan details below to calculate payments and see the amortization schedule.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Loan Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount ($)
                </label>
                <input
                  id="loanAmount"
                  type="number"
                  min="1000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <input
                  id="interestRate"
                  type="number"
                  min="0.1"
                  max="30"
                  step="0.1"
                  value={interestRateDisplay}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInterestRateDisplay(value);
                    setInterestRate(Number(value) / 100);
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Term (years)
                </label>
                <input
                  id="loanTerm"
                  type="number"
                  min="1"
                  max="40"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="paymentFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Frequency
                </label>
                <select
                  id="paymentFrequency"
                  value={paymentFrequency}
                  onChange={(e) => setPaymentFrequency(Number(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="1">Annual</option>
                  <option value="2">Semi-Annual</option>
                  <option value="4">Quarterly</option>
                  <option value="12">Monthly</option>
                  <option value="26">Bi-Weekly</option>
                  <option value="52">Weekly</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  id="paymentType"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as 'amortization' | 'fixedPrincipal')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="amortization">Regular Amortization (P&I)</option>
                  <option value="fixedPrincipal">Fixed Principal (P+I)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            {loanResult && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Loan Summary</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">
                            {getPaymentFrequencyName()} Payment:
                          </span>
                          <div className="text-2xl font-bold text-gray-900">
                            ${paymentType === 'amortization' 
                              ? loanResult.payment.toFixed(2) 
                              : loanResult.amortizationSchedule[0].payment.toFixed(2)}
                          </div>
                          {paymentType === 'fixedPrincipal' && (
                            <div className="text-sm text-gray-500">
                              Final payment: ${loanResult.amortizationSchedule[loanResult.amortizationSchedule.length - 1].payment.toFixed(2)}
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-gray-500">Loan Amount:</div>
                            <div className="font-medium">${loanAmount.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Interest Rate:</div>
                            <div className="font-medium">{(interestRate * 100).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Term:</div>
                            <div className="font-medium">{loanTerm} years</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Total Interest:</div>
                            <div className="font-medium text-red-500">${loanResult.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Total Cost:</div>
                            <div className="font-medium">${(loanAmount + loanResult.totalInterest).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="h-48">
                        {pieData && (
                          <Pie 
                            data={pieData} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                datalabels: {
                                  formatter: (value, ctx) => {
                                    const total = ctx.dataset.data.reduce((a: any, b: any) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1) + '%';
                                    return percentage;
                                  },
                                  color: '#fff',
                                  font: {
                                    weight: 'bold',
                                    size: 12
                                  }
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      const label = context.label || '';
                                      const value = Number(context.raw) || 0;
                                      const total = Array.isArray(context.dataset.data)
                                        ? context.dataset.data.reduce((a: number, b: number) => a + Number(b), 0)
                                        : 0;
                                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                      return `${label}: $${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${percentage}%)`;
                                    }
                                  }
                                }
                              },
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Amortization Schedule</h2>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Print Results
                    </button>
                  </div>
                  
                  <LoanAmortizationTable 
                    schedule={loanResult.amortizationSchedule} 
                    frequency={paymentFrequency}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-10 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">How to Use This Calculator</h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              This Land Loan Calculator helps you estimate payments and understand the total cost of financing rural property, agricultural land, or farm loans.
            </p>
            
            <div>
              <h3 className="font-medium text-gray-900">Input Fields:</h3>
              <ul className="list-disc pl-5 mt-2">
                <li><strong>Loan Amount:</strong> The total amount you plan to borrow in dollars.</li>
                <li><strong>Interest Rate:</strong> The annual interest rate on the loan (as a percentage).</li>
                <li><strong>Loan Term:</strong> The number of years you'll take to repay the loan.</li>
                <li><strong>Payment Frequency:</strong> How often you'll make payments (monthly, quarterly, etc.).</li>
                <li><strong>Payment Type:</strong> Choose between:
                  <ul className="list-disc pl-5 mt-1">
                    <li><strong>Regular Amortization (P&I):</strong> Equal payments throughout the loan term.</li>
                    <li><strong>Fixed Principal (P+I):</strong> Equal principal payments plus interest, resulting in decreasing payment amounts over time.</li>
                  </ul>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Results Explained:</h3>
              <ul className="list-disc pl-5 mt-2">
                <li><strong>Payment Amount:</strong> How much you'll pay {getPaymentFrequencyLabel()}.</li>
                <li><strong>Total Interest:</strong> The total interest paid over the life of the loan.</li>
                <li><strong>Total Cost:</strong> The combined total of principal and interest payments.</li>
                <li><strong>Amortization Schedule:</strong> A detailed breakdown of each payment, showing how much goes to principal and interest, and the remaining balance.</li>
              </ul>
            </div>
            
            <p>
              Use the Print Results button to save or print your loan calculation for reference when speaking with lenders about financing options.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 