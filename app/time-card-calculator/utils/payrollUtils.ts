import type { TimeEntry, RoundingOption, OvertimeType } from '../components/TimeCardCalculator';
import { calculateDurationInHours } from './timeUtils';

export interface PayrollSummary {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  basePay: number;
  overtimePay: number;
  totalPay: number;
}

/**
 * Calculates payroll, including regular and overtime pay.
 * For now, 'daily' and 'weekly' overtime rules are treated as mutually exclusive.
 * If 'daily' is selected, overtime is calculated per day and summed up.
 * If 'weekly' is selected, overtime is calculated based on the total hours for the period.
 */
export const calculatePayroll = (
  timeEntries: TimeEntry[],
  rounding: RoundingOption,
  basePayRateStr: string,
  overtimeType: OvertimeType,
  dailyOtThresholdStr: string,
  weeklyOtThresholdStr: string,
  otRateMultiplierStr: string
): PayrollSummary => {
  const basePayRate = parseFloat(basePayRateStr) || 0;
  const dailyOtThreshold = parseFloat(dailyOtThresholdStr) || 8;
  const weeklyOtThreshold = parseFloat(weeklyOtThresholdStr) || 40;
  const otRateMultiplier = parseFloat(otRateMultiplierStr) || 1.5;

  let overallRegularHours = 0;
  let overallOvertimeHours = 0;

  // 1. Calculate hours for each entry (daily hours)
  const entriesWithHours = timeEntries.map(entry => ({
    ...entry,
    hours: calculateDurationInHours(entry.startTime, entry.endTime, entry.breakDeduction, rounding),
  }));

  if (overtimeType === 'daily') {
    const dailyHoursMap = new Map<string, number>();
    entriesWithHours.forEach(entry => {
      dailyHoursMap.set(entry.date, (dailyHoursMap.get(entry.date) || 0) + entry.hours);
    });

    dailyHoursMap.forEach(dailyTotalHours => {
      if (dailyTotalHours > dailyOtThreshold) {
        overallOvertimeHours += dailyTotalHours - dailyOtThreshold;
        overallRegularHours += dailyOtThreshold;
      } else {
        overallRegularHours += dailyTotalHours;
      }
    });

  } else if (overtimeType === 'weekly') {
    const totalPeriodHours = entriesWithHours.reduce((sum, entry) => sum + entry.hours, 0);
    if (totalPeriodHours > weeklyOtThreshold) {
      overallOvertimeHours = totalPeriodHours - weeklyOtThreshold;
      overallRegularHours = weeklyOtThreshold;
    } else {
      overallRegularHours = totalPeriodHours;
    }
  } else { // 'none' or any other case
    overallRegularHours = entriesWithHours.reduce((sum, entry) => sum + entry.hours, 0);
  }
  
  const totalCalculatedHours = overallRegularHours + overallOvertimeHours;

  const basePay = overallRegularHours * basePayRate;
  const overtimePay = overallOvertimeHours * basePayRate * otRateMultiplier;
  const totalPay = basePay + overtimePay;

  return {
    totalHours: totalCalculatedHours, // This should match sum of entry.hours if logic is correct
    regularHours: overallRegularHours,
    overtimeHours: overallOvertimeHours,
    basePay,
    overtimePay,
    totalPay,
  };
}; 