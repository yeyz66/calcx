// Parses a HH:MM time string to total minutes from midnight
export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Parses a break deduction string (e.g., "30m", "1.5h") to minutes
export const parseBreakDeductionToMinutes = (breakStr: string): number => {
  if (!breakStr) return 0;
  let totalMinutes = 0;
  const hoursMatch = breakStr.match(/(\d*\.?\d+)\s*h/i);
  const minutesMatch = breakStr.match(/(\d+)\s*m/i);

  if (hoursMatch && hoursMatch[1]) {
    totalMinutes += parseFloat(hoursMatch[1]) * 60;
  }
  if (minutesMatch && minutesMatch[1]) {
    totalMinutes += parseInt(minutesMatch[1], 10);
  }
  return Math.round(totalMinutes);
};

// Helper function to round minutes to the nearest specified interval
export const roundMinutes = (totalMinutes: number, roundTo: 0 | 5 | 10 | 15 | 30 | 60): number => {
  if (roundTo === 0) {
    return totalMinutes;
  }
  return Math.round(totalMinutes / roundTo) * roundTo;
};

// Calculates duration in hours between two HH:MM time strings, considering break and rounding
export const calculateDurationInHours = (
  startTime: string,
  endTime: string,
  breakDeduction: string,
  rounding: 0 | 5 | 10 | 15 | 30 | 60 = 0 // Default to no rounding
): number => {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  const breakMinutes = parseBreakDeductionToMinutes(breakDeduction);

  let effectiveEndMinutes = endMinutes;
  // Handle overnight shifts or end time being 00:00
  // If end time is 00:00 and start isn't, or if end time is earlier than start time (overnight)
  if ((endMinutes === 0 && startMinutes > 0) || (endMinutes < startMinutes && startMinutes !== 0)) {
    effectiveEndMinutes += 24 * 60;
  }

  let durationMinutes = effectiveEndMinutes - startMinutes - breakMinutes;

  // Ensure duration is not negative
  if (durationMinutes < 0) {
    durationMinutes = 0;
  }

  const roundedDurationMinutes = roundMinutes(durationMinutes, rounding);

  return roundedDurationMinutes / 60;
};

// Formats total minutes to a HH:MM string or decimal hours
export const formatMinutes = (totalMinutes: number, asHours: boolean = false): string => {
  if (asHours) {
    return (totalMinutes / 60).toFixed(2);
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Helper to parse YYYY-MM-DD string to a Date object (UTC to avoid timezone issues with date-only)
const parseYyyyMmDdToDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)); // Month is 0-indexed
};

// Helper to format a Date object to YYYY-MM-DD string (from UTC components)
export const formatDateToYyyyMmDd = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Gets the start of the week for a given date.
 * @param dateString Date in YYYY-MM-DD format.
 * @param firstDayOfWeek 0 for Sunday, 1 for Monday, etc.
 * @returns Date object for the start of the week.
 */
export const getWeekStartDate = (dateString: string, firstDayOfWeek: number = 1): Date => {
    const date = parseYyyyMmDdToDate(dateString);
    const dayOfWeek = date.getUTCDay(); // Sunday is 0, Monday is 1, ...
    let diff = dayOfWeek - firstDayOfWeek;
    if (diff < 0) {
        diff += 7; // Ensure diff is positive to go back to the correct start day
    }
    const weekStartDate = new Date(date);
    weekStartDate.setUTCDate(date.getUTCDate() - diff);
    return weekStartDate;
};

/**
 * Gets the end of the week for a given date.
 * @param dateString Date in YYYY-MM-DD format.
 * @param firstDayOfWeek 0 for Sunday, 1 for Monday, etc.
 * @returns Date object for the end of the week.
 */
export const getWeekEndDate = (dateString: string, firstDayOfWeek: number = 1): Date => {
    const weekStartDate = getWeekStartDate(dateString, firstDayOfWeek);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setUTCDate(weekStartDate.getUTCDate() + 6);
    return weekEndDate;
};

/**
 * Generates an array of date strings (YYYY-MM-DD) for each day in the interval.
 * @param startDate Date object for the start of the interval.
 * @param endDate Date object for the end of the interval.
 * @returns Array of date strings.
 */
export const eachDayOfInterval = (startDate: Date, endDate: Date): string[] => {
    const dates: string[] = [];
    let currentDate = new Date(startDate);
    currentDate.setUTCHours(0,0,0,0); // Normalize time part
    const finalDate = new Date(endDate);
    finalDate.setUTCHours(0,0,0,0); // Normalize time part

    while (currentDate <= finalDate) {
        dates.push(formatDateToYyyyMmDd(new Date(currentDate)));
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return dates;
}; 