import React, { useMemo } from 'react';
import { calculateDurationInHours } from '../utils/timeUtils';
import type { RoundingOption, TimeEntry } from './TimeCardCalculator';

interface TimeEntryRowProps {
  entry: TimeEntry;
  rounding: RoundingOption;
  onInputChange: (id: string, field: keyof TimeEntry, value: string) => void;
  onRemoveRow: (id: string) => void;
  onAddRowAfter: (id: string) => void;
  isFirstRow: boolean;
  isLastRow: boolean;
}

const TimeEntryRow: React.FC<TimeEntryRowProps> = ({
  entry,
  rounding,
  onInputChange,
  onRemoveRow,
  onAddRowAfter,
  isFirstRow,
  isLastRow
}) => {
  const { id, date, startTime, endTime, breakDeduction, isBlank } = entry;

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isBlank) return;
    onInputChange(id, e.target.name as keyof TimeEntry, e.target.value);
  };

  const hoursWorked = useMemo(() => {
    if (isBlank || !startTime || !endTime) return 0;
    return calculateDurationInHours(startTime, endTime, breakDeduction, rounding);
  }, [startTime, endTime, breakDeduction, rounding, isBlank]);

  const commonInputClasses = "w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const disabledInputClasses = `${commonInputClasses} bg-gray-100 cursor-not-allowed opacity-70`;
  const cellPadding = "px-3 py-1.5 align-middle";

  return (
    <tr className={isBlank ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"}>
      <td className={`${cellPadding}`}>
        <input
          type="date"
          name="date"
          value={date}
          onChange={handleFieldChange}
          className={isBlank ? disabledInputClasses : commonInputClasses}
          aria-label="Date"
          readOnly={isBlank}
        />
      </td>
      <td className={`${cellPadding}`}>
        <input
          type="time"
          name="startTime"
          value={startTime}
          onChange={handleFieldChange}
          className={isBlank ? disabledInputClasses : commonInputClasses}
          aria-label="Start Time"
          disabled={isBlank}
        />
      </td>
      <td className={`${cellPadding}`}>
        <input
          type="time"
          name="endTime"
          value={endTime}
          onChange={handleFieldChange}
          className={isBlank ? disabledInputClasses : commonInputClasses}
          aria-label="End Time"
          disabled={isBlank}
        />
      </td>
      <td className={`${cellPadding}`}>
        <input
          type="text"
          name="breakDeduction"
          value={breakDeduction}
          onChange={handleFieldChange}
          placeholder={isBlank ? "-" : "e.g., 30m"}
          className={isBlank ? disabledInputClasses : commonInputClasses}
          aria-label="Break Deduction"
          disabled={isBlank}
        />
      </td>
      <td className={`${cellPadding} text-center`}>
        <div className={`px-2 py-1.5 border rounded-md ${isBlank ? "bg-gray-200 text-gray-500" : "bg-gray-100 text-gray-800"}`}>
          {hoursWorked.toFixed(2)}
        </div>
      </td>
      <td className={`${cellPadding} text-center whitespace-nowrap`}>
        <button
          onClick={() => onRemoveRow(id)}
          className={`px-3 py-1.5 text-white rounded transition-colors text-xs font-medium ${isBlank ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
          aria-label="Remove Row"
          disabled={isBlank}
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

export default TimeEntryRow; 