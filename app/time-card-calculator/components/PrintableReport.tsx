import React from 'react';
import type { TimeEntry, RoundingOption } from './TimeCardCalculator';
import type { PayrollSummary } from '../utils/payrollUtils';
import { calculateDurationInHours } from '../utils/timeUtils'; // To recalculate individual row hours for display

interface PrintableReportProps {
  reportHeader: string;
  reportNotes: string;
  timeEntriesToDisplay: TimeEntry[];
  payrollSummary: PayrollSummary | null;
  includePaymentInfo: boolean;
  rounding: RoundingOption; // To display the rounding rule used
  basePayRate: number;
  overtimeRateMultiplier: number;
  overtimeType: string;
}

const roundingLabel = (roundingValue: RoundingOption): string => {
    switch (roundingValue) {
        case 0: return 'No Rounding';
        case 5: return 'Nearest 5 min';
        case 10: return 'Nearest 10 min';
        case 15: return 'Nearest 15 min';
        case 30: return 'Nearest 30 min';
        case 60: return 'Nearest hour';
        default: return '';
    }
}

const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(({
  reportHeader,
  reportNotes,
  timeEntriesToDisplay = [],
  payrollSummary = null,
  includePaymentInfo,
  rounding,
  basePayRate,
  overtimeRateMultiplier,
  overtimeType
}, ref) => {

  // Filter out entries that are completely blank and have no user input potential
  // This is slightly different from isBlank, as isBlank can be true for a row with just a date.
  const relevantEntries = timeEntriesToDisplay.filter(entry => 
    !entry.isBlank || (entry.startTime || entry.endTime || entry.breakDeduction)
  );

  return (
    <div ref={ref} className="p-4 bg-white text-black">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10px; 
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <div className="printable-area">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">{reportHeader || 'Time Card Report'}</h1>
          {/* You can add more details like employee name, period, etc. if they become available */}
        </header>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">Time Log</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Break</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {relevantEntries.map((entry) => {
                // Recalculate hours for this specific entry for display, respecting its own data
                const hours = entry.isBlank ? 0 : calculateDurationInHours(entry.startTime, entry.endTime, entry.breakDeduction, rounding);
                return (
                  <tr key={entry.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{entry.date}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{entry.startTime || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{entry.endTime || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{entry.breakDeduction || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{hours.toFixed(2)}</td>
                  </tr>
                );
              })}
              {relevantEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-2 text-center text-sm text-gray-500">No time entries logged for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2 border-b pb-1">Summary</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div><strong>Total Hours:</strong> {payrollSummary?.totalHours.toFixed(2) || 'N/A'}</div>
                {includePaymentInfo && (
                    <>
                        <div><strong>Regular Hours:</strong> {payrollSummary?.regularHours.toFixed(2) || 'N/A'}</div>
                        <div><strong>Overtime Hours:</strong> {payrollSummary?.overtimeHours.toFixed(2) || 'N/A'}</div>
                        <div><strong>Base Pay Rate:</strong> ${basePayRate.toFixed(2)} / hour</div>
                        <div><strong>Overtime Rate:</strong> {overtimeRateMultiplier.toFixed(2)}x base</div>
                        <div><strong>Base Pay:</strong> ${payrollSummary?.basePay.toFixed(2) || 'N/A'}</div>
                        <div><strong>Overtime Pay:</strong> ${payrollSummary?.overtimePay.toFixed(2) || 'N/A'}</div>
                        <div className="font-bold col-span-2 mt-1"><strong>Total Pay:</strong> ${payrollSummary?.totalPay.toFixed(2) || 'N/A'}</div>
                    </>
                )}
            </div>
             <p className="text-xs text-gray-600 mt-2">Rounding Rule Applied: {roundingLabel(rounding)}</p>
        </section>

        {reportNotes && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2 border-b pb-1">Notes</h2>
            <p className="text-sm whitespace-pre-wrap">{reportNotes}</p>
          </section>
        )}

        <footer className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
          Generated by Time Card Calculator
        </footer>
      </div>
    </div>
  );
});

PrintableReport.displayName = 'PrintableReport';
export default PrintableReport; 