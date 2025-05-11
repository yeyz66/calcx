'use client';

import React, { useState } from 'react';

type AmortizationRow = {
  month: number;
  interest: number;
  principal: number;
  balance: number;
  payment: number;
};

interface AmortizationTableProps {
  schedule: AmortizationRow[];
}

const AmortizationTable: React.FC<AmortizationTableProps> = ({ schedule }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Initially show just first 12 months (1 year) or if expanded, show all
  const displayRows = expanded ? schedule : schedule.slice(0, 12);
  
  return (
    <div className="overflow-x-auto">
      <h3 className="font-semibold mb-2">Amortization Schedule</h3>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 text-left">Month</th>
            <th className="px-2 py-1 text-left">Payment</th>
            <th className="px-2 py-1 text-left">Principal</th>
            <th className="px-2 py-1 text-left">Interest</th>
            <th className="px-2 py-1 text-left">Ending Balance</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map(row => (
            <tr key={row.month} className="border-b hover:bg-gray-50">
              <td className="px-2 py-1">{row.month}</td>
              <td className="px-2 py-1">${row.payment.toFixed(2)}</td>
              <td className="px-2 py-1">${row.principal.toFixed(2)}</td>
              <td className="px-2 py-1">${row.interest.toFixed(2)}</td>
              <td className="px-2 py-1">${row.balance.toFixed(2)}</td>
            </tr>
          ))}
          {schedule.length > 12 && (
            <tr>
              <td colSpan={5} className="px-2 py-2 text-center">
                <button 
                  onClick={() => setExpanded(!expanded)} 
                  className="text-blue-600 hover:underline focus:outline-none"
                >
                  {expanded ? 'Show Less' : `View Full Schedule (${schedule.length} months)`}
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AmortizationTable; 