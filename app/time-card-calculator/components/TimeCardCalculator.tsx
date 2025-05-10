'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import TimeEntryRow from './TimeEntryRow';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    calculateDurationInHours,
    getWeekStartDate,
    getWeekEndDate,
    eachDayOfInterval,
    formatDateToYyyyMmDd,
    parseBreakDeductionToMinutes, // Keep this import as it might be used elsewhere or intended
} from '../utils/timeUtils';
import { calculatePayroll } from '../utils/payrollUtils';
import type { PayrollSummary } from '../utils/payrollUtils';
import PrintableReport from './PrintableReport';

export interface TimeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  breakDeduction: string; // e.g., "30m", "1h", "0.5h"
  isBlank?: boolean; // To identify placeholder rows for display
}

export type RoundingOption = 0 | 5 | 10 | 15 | 30 | 60;
export type OvertimeType = 'none' | 'daily' | 'weekly'; // Add 'daily_weekly' later if needed

const roundingOptionsDefinition: { value: RoundingOption; label: string }[] = [
  { value: 0, label: 'No Rounding' },
  { value: 5, label: 'Nearest 5 minutes' },
  { value: 10, label: 'Nearest 10 minutes' },
  { value: 15, label: 'Nearest 15 minutes' },
  { value: 30, label: 'Nearest 30 minutes' },
  { value: 60, label: 'Nearest hour' },
];

const overtimeTypeOptions: { value: OvertimeType; label: string }[] = [
    { value: 'none', label: 'No Overtime' },
    { value: 'daily', label: 'Overtime after X hours / day' },
    { value: 'weekly', label: 'Overtime after X hours / week' },
];

const initialEntry = (date?: string): TimeEntry => ({
  id: uuidv4(),
  date: date || formatDateToYyyyMmDd(new Date()),
  startTime: '09:00',
  endTime: '17:00',
  breakDeduction: '30m',
  isBlank: false,
});

const createBlankEntry = (date: string): TimeEntry => ({
    id: uuidv4(),
    date: date,
    startTime: '',
    endTime: '',
    breakDeduction: '',
    isBlank: true,
});

const LOCAL_STORAGE_KEYS = {
  TIME_ENTRIES: 'timeCardCalculator_entries',
  ROUNDING: 'timeCardCalculator_rounding',
  BASE_PAY_RATE: 'timeCardCalculator_basePayRate',
  OVERTIME_TYPE: 'timeCardCalculator_overtimeType',
  DAILY_OT_THRESHOLD: 'timeCardCalculator_dailyOtThreshold',
  WEEKLY_OT_THRESHOLD: 'timeCardCalculator_weeklyOtThreshold',
  OT_RATE_MULTIPLIER: 'timeCardCalculator_otRateMultiplier',
  REPORT_HEADER: 'timeCardCalculator_reportHeader',
  REPORT_NOTES: 'timeCardCalculator_reportNotes',
  INCLUDE_PAYMENT_INFO: 'timeCardCalculator_includePaymentInfo',
  SHOW_BLANK_DAYS: 'timeCardCalculator_showBlankDays',
};

const TimeCardCalculator: React.FC = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const savedEntries = localStorage.getItem(LOCAL_STORAGE_KEYS.TIME_ENTRIES);
      if (savedEntries) {
        try {
          const parsedEntries = JSON.parse(savedEntries) as TimeEntry[];
          if (Array.isArray(parsedEntries) && parsedEntries.every(item => item && typeof item.id === 'string')) {
            return parsedEntries.map(e => ({...e, isBlank: false})); 
          }
        } catch (error) {
          console.error("Error parsing saved time entries from localStorage:", error);
        }
      }
    }
    return [initialEntry()];
  });

  const [rounding, setRounding] = useState<RoundingOption>(() => {
    if (typeof window !== 'undefined') {
      const savedRounding = localStorage.getItem(LOCAL_STORAGE_KEYS.ROUNDING);
      if (savedRounding) {
        const parsedRounding = Number(savedRounding) as RoundingOption;
        if (roundingOptionsDefinition.some(opt => opt.value === parsedRounding)) {
            return parsedRounding;
        }
      }
    }
    return 0;
  });

  const [includePaymentInfo, setIncludePaymentInfo] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.INCLUDE_PAYMENT_INFO);
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  const [showBlankDays, setShowBlankDays] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SHOW_BLANK_DAYS);
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });

  const [basePayRate, setBasePayRate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedRate = localStorage.getItem(LOCAL_STORAGE_KEYS.BASE_PAY_RATE);
      return savedRate !== null ? savedRate : '10';
    }
    return '10';
  });

  const [overtimeType, setOvertimeType] = useState<OvertimeType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.OVERTIME_TYPE) as OvertimeType;
      if (saved && overtimeTypeOptions.some(opt => opt.value === saved)) return saved;
    }
    return 'none';
  });

  const [dailyOvertimeThreshold, setDailyOvertimeThreshold] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.DAILY_OT_THRESHOLD);
      return saved !== null ? saved : '8';
    }
    return '8';
  });

  const [weeklyOvertimeThreshold, setWeeklyOvertimeThreshold] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.WEEKLY_OT_THRESHOLD);
      return saved !== null ? saved : '40';
    }
    return '40';
  });

  const [overtimeRateMultiplier, setOvertimeRateMultiplier] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.OT_RATE_MULTIPLIER);
      return saved !== null ? saved : '1.5';
    }
    return '1.5';
  });

  const [reportHeader, setReportHeader] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.REPORT_HEADER);
      return saved !== null ? saved : 'Weekly Time Report';
    }
    return 'Weekly Time Report';
  });

  const [reportNotes, setReportNotes] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.REPORT_NOTES);
      return saved !== null ? saved : '';
    }
    return '';
  });

  const reportComponentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(timeEntries.filter(e => !e.isBlank))); }, [timeEntries]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEYS.ROUNDING, String(rounding)); }, [rounding]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEYS.BASE_PAY_RATE, basePayRate); }, [basePayRate]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEYS.OVERTIME_TYPE, overtimeType); }, [overtimeType]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEYS.DAILY_OT_THRESHOLD, dailyOvertimeThreshold); }, [dailyOvertimeThreshold]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEYS.WEEKLY_OT_THRESHOLD, weeklyOvertimeThreshold); }, [weeklyOvertimeThreshold]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEYS.OT_RATE_MULTIPLIER, overtimeRateMultiplier); }, [overtimeRateMultiplier]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEYS.REPORT_HEADER, reportHeader); }, [reportHeader]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEYS.REPORT_NOTES, reportNotes); }, [reportNotes]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEYS.INCLUDE_PAYMENT_INFO, JSON.stringify(includePaymentInfo)); }, [includePaymentInfo]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEYS.SHOW_BLANK_DAYS, JSON.stringify(showBlankDays)); }, [showBlankDays]);

  const handleAddRow = (date?: string) => {
    const newEntryDate = date || formatDateToYyyyMmDd(new Date());
    const existingBlankIndex = processedEntriesForDisplay.findIndex(e => e.date === newEntryDate && e.isBlank);

    if (existingBlankIndex !== -1 && showBlankDays) {
        const newActualEntry = initialEntry(newEntryDate);
        setTimeEntries([...timeEntries.filter(e => !(e.date === newEntryDate && e.isBlank)), newActualEntry].sort((a, b) => a.date.localeCompare(b.date)));
    } else {
        setTimeEntries([...timeEntries, initialEntry(newEntryDate)].sort((a, b) => a.date.localeCompare(b.date)));
    }
  };

  const handleRemoveRow = (id: string) => {
    setTimeEntries(timeEntries.filter(entry => entry.id !== id));
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    setTimeEntries(
      timeEntries.map(entry => {
        if (entry.id === id) {
          const isNowBlank = field === 'startTime' && value === '' && entry.endTime === '' && entry.breakDeduction === '';
          return { ...entry, [field]: value, isBlank: isNowBlank };
        }
        return entry;
      })
    );
  };

  const handleClearAll = () => setTimeEntries([initialEntry()]);
  
  const handleCopyFirstRow = () => {
    const actualEntries = timeEntries.filter(e => !e.isBlank);
    if (actualEntries.length === 0) return;
    const firstActualEntry = actualEntries[0];

    setTimeEntries(
      timeEntries.map(entry => {
        if (entry.isBlank || entry.id === firstActualEntry.id) return entry; 
        return {
          ...entry,
          startTime: firstActualEntry.startTime,
          endTime: firstActualEntry.endTime,
          breakDeduction: firstActualEntry.breakDeduction,
          isBlank: false,
        };
      })
    );
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
        const printContent = reportComponentRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            const printSection = document.createElement('div');
            printSection.innerHTML = printContent.innerHTML;
            
            // Temporarily hide all other elements
            Array.from(document.body.children).forEach(child => {
                if (child instanceof HTMLElement) child.style.display = 'none';
            });
            
            document.body.appendChild(printSection);
            window.print();
            document.body.removeChild(printSection);
            
            // Restore original content and styles
            Array.from(document.body.children).forEach(child => {
                if (child instanceof HTMLElement) child.style.display = ''; // Reset display
            });
        }
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(reportHeader, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100); // Light gray for subtitle text if any, or default

    const tableColumn = ["Date", "Start Time", "End Time", "Break", "Hours Worked"];
    const tableRows: (string | number)[][] = [];

    processedEntriesForDisplay.forEach(entry => {
      if (entry.isBlank) return; // Skip blank entries for PDF
      const duration = calculateDurationInHours(entry.startTime, entry.endTime, entry.breakDeduction, rounding);
      const tableRow = [
        entry.date,
        entry.startTime,
        entry.endTime,
        entry.breakDeduction,
        duration.toFixed(2)
      ];
      tableRows.push(tableRow);
    });

    autoTable(doc, {
      head: [tableColumn], 
      body: tableRows, 
      startY: 30, 
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] }, // Example header color
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 25 }, 4: { halign: 'right'} }, // Date column width, align hours right
    });

    let finalY = (doc as any).lastAutoTable.finalY || 30;
    finalY += 10; // Add some margin

    if (includePaymentInfo && payrollSummary) {
      doc.setFontSize(12);
      doc.text("Payroll Summary", 14, finalY);
      finalY += 7;
      doc.setFontSize(10);
      const summaryData = [
        [`Total Regular Hours:`, `${payrollSummary.regularHours.toFixed(2)} hrs`],
        [`Total Overtime Hours:`, `${payrollSummary.overtimeHours.toFixed(2)} hrs`],
        [`Total Hours:`, `${payrollSummary.totalHours.toFixed(2)} hrs`],
        ["", ""], // Spacer
        [`Regular Pay:`, `$${payrollSummary.basePay.toFixed(2)}`],
        [`Overtime Pay:`, `$${payrollSummary.overtimePay.toFixed(2)}`],
        [`Total Gross Pay:`, `$${payrollSummary.totalPay.toFixed(2)}`]
      ];
      autoTable(doc, {
        body: summaryData,
        startY: finalY,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1 },
        columnStyles: { 0: { fontStyle: 'bold'} },
        didParseCell: function (data) {
            if (data.row.index >=3 && data.row.index <=4 && data.column.index === 0 ) { // Style Pay labels
                 data.cell.styles.fontStyle = 'normal';
            }
            if (data.row.section === 'body' && data.row.index === summaryData.length -1) { // Last row (Total Gross Pay)
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 11;
            }
        }
      });
      finalY = (doc as any).lastAutoTable.finalY || finalY;
    }

    if (reportNotes.trim() !== '') {
      finalY += 10;
      doc.setFontSize(12);
      doc.text("Notes:", 14, finalY);
      finalY += 7;
      doc.setFontSize(10);
      const notesLines = doc.splitTextToSize(reportNotes, doc.internal.pageSize.getWidth() - 28); // Full width minus margins
      doc.text(notesLines, 14, finalY);
    }

    // Add a footer with page number
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save('time-card-report.pdf');
  };

  const processedEntriesForDisplay = useMemo<TimeEntry[]>(() => {
    let entriesToDisplay: TimeEntry[] = [...timeEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));

    if (showBlankDays) {
        if (entriesToDisplay.length === 0) {
            // If no entries, show blank for today
            return [createBlankEntry(formatDateToYyyyMmDd(new Date()))];
        }

        const firstDateStr = entriesToDisplay[0].date;
        const lastDateStr = entriesToDisplay[entriesToDisplay.length - 1].date;

        const weekStart = getWeekStartDate(firstDateStr); 
        const weekEnd = getWeekEndDate(lastDateStr);
        
        const allDaysInDisplayedRange = eachDayOfInterval(weekStart, weekEnd);
        
        const filledEntries: TimeEntry[] = [];
        let currentEntryIndex = 0;

        allDaysInDisplayedRange.forEach(dayStr => {
            const entriesForThisDay = entriesToDisplay.filter(e => e.date === dayStr && !e.isBlank);
            if (entriesForThisDay.length > 0) {
                entriesForThisDay.forEach(e => filledEntries.push(e));
            } else {
                // Only add a blank entry if no actual entry exists for this day
                if (!entriesToDisplay.some(e => e.date === dayStr && !e.isBlank)){
                    filledEntries.push(createBlankEntry(dayStr));
                }
            }
        });
        return filledEntries.sort((a,b) => a.date.localeCompare(b.date));
    }
    return entriesToDisplay.filter(e => !e.isBlank);
}, [timeEntries, showBlankDays]);


  const payrollSummary: PayrollSummary | null = useMemo(() => {
    if (!includePaymentInfo || isNaN(parseFloat(basePayRate)) || parseFloat(basePayRate) < 0) {
      return null;
    }

    return calculatePayroll(
      processedEntriesForDisplay.filter(e => !e.isBlank), // Ensure only actual entries are used for payroll
      rounding, // Corrected: pass rounding here
      basePayRate, // Corrected: pass basePayRate (string) here
      overtimeType, // Correct
      dailyOvertimeThreshold, // Correct: pass dailyOvertimeThreshold (string)
      weeklyOvertimeThreshold, // Correct: pass weeklyOvertimeThreshold (string)
      overtimeRateMultiplier // Correct: pass overtimeRateMultiplier (string)
    );
  }, [processedEntriesForDisplay, basePayRate, overtimeType, dailyOvertimeThreshold, weeklyOvertimeThreshold, overtimeRateMultiplier, rounding, includePaymentInfo]);

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      {/* Report Customization Section */}
      <div className="mb-6 p-4 border border-gray-200 rounded-md">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Report Customization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reportHeader" className="block text-sm font-medium text-gray-700 mb-1">Report Header Text</label>
            <input
              type="text"
              id="reportHeader"
              value={reportHeader}
              onChange={(e) => setReportHeader(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="reportNotes" className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              id="reportNotes"
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center">
            <input
                id="includePaymentInfo"
                type="checkbox"
                checked={includePaymentInfo}
                onChange={(e) => setIncludePaymentInfo(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="includePaymentInfo" className="ml-2 block text-sm text-gray-900">Include Payment Info</label>
          </div>
           <div className="flex items-center">
            <input
                id="showBlankDays"
                type="checkbox"
                checked={showBlankDays}
                onChange={(e) => setShowBlankDays(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="showBlankDays" className="ml-2 block text-sm text-gray-900">Show Blank Days in Period</label>
          </div>
        </div>
      </div>

      {/* Time Entry Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Start Time</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">End Time</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Break</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Hours</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedEntriesForDisplay.map((entry, index) => (
              <TimeEntryRow
                key={entry.id} 
                entry={entry}
                onInputChange={handleInputChange}
                onRemoveRow={handleRemoveRow}
                onAddRowAfter={() => handleAddRow(entry.date)} // Pass date to add row for specific day
                isFirstRow={index === 0 && processedEntriesForDisplay.length === 1} // Simplification, might need adjustment for all-blank state
                isLastRow={index === processedEntriesForDisplay.length - 1}
                rounding={rounding}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => handleAddRow()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          Add Day / Entry
        </button>
        <button
            onClick={handleCopyFirstRow}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-medium"
            disabled={timeEntries.filter(e => !e.isBlank).length === 0}
        >
            Copy First Day to All
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors text-sm font-medium no-print"
        >
          Print Report
        </button>
        <button
          onClick={handleDownloadPdf} 
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
        >
          Download PDF
        </button>
        <button
          onClick={handleClearAll}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          Clear All Entries
        </button>
         {/* Rounding Select Dropdown */}
        <div className="relative">
            <label htmlFor="rounding-select" className="sr-only">Rounding:</label>
            <select 
                id="rounding-select"
                value={rounding}
                onChange={(e) => setRounding(Number(e.target.value) as RoundingOption)}
                className="appearance-none px-4 py-2 border border-gray-300 rounded bg-white text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {roundingOptionsDefinition.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Totals and Payroll Summary */}
      { payrollSummary && (
        <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div><strong>Total Regular Hours:</strong> {payrollSummary.regularHours.toFixed(2)}</div>
                <div><strong>Total Overtime Hours:</strong> {payrollSummary.overtimeHours.toFixed(2)}</div>
                <div className="font-semibold"><strong>Total Hours:</strong> {payrollSummary.totalHours.toFixed(2)}</div>
                
                {includePaymentInfo && (
                    <>
                        <div className="mt-2 pt-2 border-t col-span-full md:col-span-1"><strong>Base Pay Rate:</strong> ${parseFloat(basePayRate).toFixed(2)}/hr</div>
                        {overtimeType !== 'none' && <div className="mt-2 pt-2 border-t col-span-full md:col-span-1"><strong>OT Multiplier:</strong> {parseFloat(overtimeRateMultiplier).toFixed(2)}x</div>}
                        <div className="mt-2 pt-2 border-t col-span-full md:col-span-1"></div> {/* Spacer */}

                        <div><strong>Regular Pay:</strong> ${payrollSummary.basePay.toFixed(2)}</div>
                        <div><strong>Overtime Pay:</strong> ${payrollSummary.overtimePay.toFixed(2)}</div>
                        <div className="font-bold text-base"><strong>Total Gross Pay:</strong> ${payrollSummary.totalPay.toFixed(2)}</div>
                    </>
                )}
            </div>
        </div>
      )}
      {!payrollSummary && includePaymentInfo && (
           <div className="mt-6 p-4 border border-yellow-300 rounded-md bg-yellow-50 text-yellow-700 text-sm">
            Please enter a valid Base Pay Rate (positive number) to see the payment summary.
          </div>
      )}


      {/* Printable Report (Hidden) */}
      <div className="hidden print:block">
        <PrintableReport
          ref={reportComponentRef}
          timeEntriesToDisplay={processedEntriesForDisplay.filter(e => !e.isBlank)}
          payrollSummary={payrollSummary}
          reportHeader={reportHeader}
          reportNotes={reportNotes}
          includePaymentInfo={includePaymentInfo}
          basePayRate={parseFloat(basePayRate)}
          overtimeRateMultiplier={parseFloat(overtimeRateMultiplier)}
          rounding={rounding}
          overtimeType={overtimeType}
        />
      </div>
    </div>
  );
};

export default TimeCardCalculator; 