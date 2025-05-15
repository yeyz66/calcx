export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export interface CyclePrediction {
  cycleNumber: number;
  periodStartDate: Date;
  periodEndDate: Date;
  ovulationDate: Date;
  fertileWindowStartDate: Date;
  fertileWindowEndDate: Date;
}

export const calculateFutureCycles = (
  lastPeriodDateStr: string,
  periodDuration: number,
  cycleLength: number,
  numberOfCycles: number = 6
): CyclePrediction[] => {
  const predictions: CyclePrediction[] = [];
  if (!lastPeriodDateStr) return predictions;

  const lastPeriodStartDate = new Date(lastPeriodDateStr);
  // Adjust for timezone offset to ensure the date is interpreted as local
  lastPeriodStartDate.setMinutes(lastPeriodStartDate.getMinutes() + lastPeriodStartDate.getTimezoneOffset());


  for (let i = 0; i < numberOfCycles; i++) {
    const currentCycleStartDate = new Date(lastPeriodStartDate);
    currentCycleStartDate.setDate(lastPeriodStartDate.getDate() + i * cycleLength);

    const currentPeriodEndDate = new Date(currentCycleStartDate);
    currentPeriodEndDate.setDate(currentCycleStartDate.getDate() + periodDuration - 1);

    // Ovulation is typically 14 days BEFORE the NEXT period starts.
    // So, first find the start of the NEXT cycle.
    const nextCycleStartDate = new Date(currentCycleStartDate);
    nextCycleStartDate.setDate(currentCycleStartDate.getDate() + cycleLength);

    const ovulationDate = new Date(nextCycleStartDate);
    ovulationDate.setDate(nextCycleStartDate.getDate() - 14);

    // Fertile window is typically 5 days before ovulation and the day of ovulation.
    const fertileWindowStartDate = new Date(ovulationDate);
    fertileWindowStartDate.setDate(ovulationDate.getDate() - 5);

    const fertileWindowEndDate = new Date(ovulationDate);
    // fertileWindowEndDate.setDate(ovulationDate.getDate()); // This is just the ovulation day

    predictions.push({
      cycleNumber: i + 1,
      periodStartDate: currentCycleStartDate,
      periodEndDate: currentPeriodEndDate,
      ovulationDate: ovulationDate,
      fertileWindowStartDate: fertileWindowStartDate,
      fertileWindowEndDate: fertileWindowEndDate, // Ovulation day is the end of the fertile window in this common model
    });
  }

  return predictions;
}; 