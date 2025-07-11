export interface CoastFireInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  annualSpending: number;
  investmentReturn: number;
  inflationRate: number;
  safeWithdrawalRate: number;
}

export interface CoastFireResults {
  coastFireNumber: number;
  projectedNetWorth: number;
  yearsToRetirement: number;
  realReturnRate: number;
  isCoastFire: boolean;
  shortfall: number;
  monthlyContributionNeeded: number;
  projectionData: Array<{
    age: number;
    year: number;
    netWorth: number;
    coastFireTarget: number;
  }>;
}

export function calculateCoastFire(inputs: CoastFireInputs): CoastFireResults {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    annualSpending,
    investmentReturn,
    inflationRate,
    safeWithdrawalRate,
  } = inputs;

  const yearsToRetirement = retirementAge - currentAge;
  const realReturnRate = (investmentReturn - inflationRate) / 100;
  
  // Calculate the Coast FIRE number (amount needed today to reach retirement goal)
  const futureValueNeeded = annualSpending / (safeWithdrawalRate / 100);
  const coastFireNumber = futureValueNeeded / Math.pow(1 + realReturnRate, yearsToRetirement);
  
  // Calculate projected net worth at retirement
  const projectedNetWorth = currentSavings * Math.pow(1 + realReturnRate, yearsToRetirement);
  
  // Check if already at Coast FIRE
  const isCoastFire = currentSavings >= coastFireNumber;
  const shortfall = Math.max(0, coastFireNumber - currentSavings);
  
  // Calculate monthly contribution needed to reach Coast FIRE
  const monthlyContributionNeeded = isCoastFire 
    ? 0 
    : calculateMonthlyContribution(shortfall, realReturnRate, yearsToRetirement);
  
  // Generate projection data for chart
  const projectionData = generateProjectionData(
    currentAge,
    retirementAge,
    currentSavings,
    annualSpending,
    realReturnRate,
    safeWithdrawalRate
  );

  return {
    coastFireNumber,
    projectedNetWorth,
    yearsToRetirement,
    realReturnRate: realReturnRate * 100,
    isCoastFire,
    shortfall,
    monthlyContributionNeeded,
    projectionData,
  };
}

function calculateMonthlyContribution(
  targetAmount: number,
  annualRate: number,
  years: number
): number {
  if (years <= 0) return 0;
  
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;
  
  if (monthlyRate === 0) {
    return targetAmount / totalMonths;
  }
  
  // Future value of ordinary annuity formula solved for payment
  const futureValueFactor = (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
  return targetAmount / futureValueFactor;
}

function generateProjectionData(
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  annualSpending: number,
  realReturnRate: number,
  safeWithdrawalRate: number
): Array<{
  age: number;
  year: number;
  netWorth: number;
  coastFireTarget: number;
}> {
  const data = [];
  const currentYear = new Date().getFullYear();
  
  for (let age = currentAge; age <= retirementAge; age++) {
    const yearsFromNow = age - currentAge;
    const yearsToRetirement = retirementAge - age;
    
    // Net worth growth from current savings
    const netWorth = currentSavings * Math.pow(1 + realReturnRate, yearsFromNow);
    
    // Coast FIRE target at this age
    const futureValueNeeded = annualSpending / (safeWithdrawalRate / 100);
    const coastFireTarget = yearsToRetirement > 0 
      ? futureValueNeeded / Math.pow(1 + realReturnRate, yearsToRetirement)
      : futureValueNeeded;
    
    data.push({
      age,
      year: currentYear + yearsFromNow,
      netWorth,
      coastFireTarget,
    });
  }
  
  return data;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}