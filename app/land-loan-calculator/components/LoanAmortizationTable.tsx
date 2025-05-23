'use client';

import React, { useState } from 'react';

type AmortizationRow = {
  paymentNumber: number;
  interest: number;
  principal: number;
  balance: number;
  payment: number;
};

interface LoanAmortizationTableProps {
  schedule: AmortizationRow[];
  frequency: number;
}

const LoanAmortizationTable: React.FC<LoanAmortizationTableProps> = ({ schedule, frequency }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Initially show first year of payments or if expanded, show all
  const displayRows = expanded ? schedule : schedule.slice(0, frequency);

  // Format payment number based on frequency
  const formatPaymentLabel = (paymentNumber: number) => {
    switch (frequency) {
      case 1: // Annual
        return `Year ${paymentNumber}`;
      case 2: // Semi-Annual
        return `Payment ${paymentNumber} (Year ${Math.ceil(paymentNumber/2)})`;
      case 4: // Quarterly
        return `Q${((paymentNumber-1) % 4) + 1}, Year ${Math.ceil(paymentNumber/4)}`;
      case 12: // Monthly
        return `Month ${paymentNumber}`;
      case 26: // Bi-Weekly
        return `Payment ${paymentNumber}`;
      case 52: // Weekly
        return `Week ${paymentNumber}`;
      default:
        return `Payment ${paymentNumber}`;
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <style jsx global>{`
        @media print {
          .amortization-table-container .show-less-button {
            display: none !important;
          }
          .amortization-table-container .print-all-rows {
            display: table-row !important;
          }
        }
        @media screen {
          .amortization-table-container .print-all-rows {
            display: ${expanded ? 'table-row' : 'none'};
          }
        }
      `}</style>
      <div className="amortization-table-container">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 text-left">Payment #</th>
              <th className="px-2 py-1 text-left">Payment</th>
              <th className="px-2 py-1 text-left">Principal</th>
              <th className="px-2 py-1 text-left">Interest</th>
              <th className="px-2 py-1 text-left">Remaining Balance</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, index) => (
              <tr 
                key={row.paymentNumber} 
                className={`border-b hover:bg-gray-50 ${index >= frequency ? 'print-all-rows' : ''}`}
              >
                <td className="px-2 py-1">{formatPaymentLabel(row.paymentNumber)}</td>
                <td className="px-2 py-1">${row.payment.toFixed(2)}</td>
                <td className="px-2 py-1">${row.principal.toFixed(2)}</td>
                <td className="px-2 py-1">${row.interest.toFixed(2)}</td>
                <td className="px-2 py-1">${row.balance.toFixed(2)}</td>
              </tr>
            ))}
            {schedule.length > frequency && (
              <tr className="show-less-button">
                <td colSpan={5} className="px-2 py-2 text-center">
                  <button 
                    onClick={() => setExpanded(!expanded)} 
                    className="text-blue-600 hover:underline focus:outline-none"
                  >
                    {expanded ? 'Show Less' : `View Full Schedule (${schedule.length} payments)`}
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoanAmortizationTable; 