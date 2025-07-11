'use client';

import React, { useState, useEffect } from 'react';
import { calculateCoastFire, formatCurrency, formatPercentage, CoastFireInputs } from './utils/calculations';
import CoastFireChart from './components/CoastFireChart';

export default function CoastFireCalculator() {
  const [inputs, setInputs] = useState<CoastFireInputs>({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    annualSpending: 50000,
    investmentReturn: 7,
    inflationRate: 3,
    safeWithdrawalRate: 4,
  });

  const [results, setResults] = useState(() => calculateCoastFire(inputs));

  useEffect(() => {
    setResults(calculateCoastFire(inputs));
  }, [inputs]);

  const handleInputChange = (field: keyof CoastFireInputs, value: number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const InputField = ({ 
    label, 
    value, 
    field, 
    min = 0, 
    max, 
    step = 1, 
    prefix = '', 
    suffix = '' 
  }: {
    label: string;
    value: number;
    field: keyof CoastFireInputs;
    min?: number;
    max?: number;
    step?: number;
    prefix?: string;
    suffix?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => handleInputChange(field, parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            prefix ? 'pl-8' : ''
          } ${suffix ? 'pr-8' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Coast FIRE Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calculate when you have enough invested to coast to retirement without additional contributions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Information
            </h2>
            
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Current Age"
                  value={inputs.currentAge}
                  field="currentAge"
                  min={18}
                  max={100}
                  suffix="years"
                />
                <InputField
                  label="Planned Retirement Age"
                  value={inputs.retirementAge}
                  field="retirementAge"
                  min={50}
                  max={100}
                  suffix="years"
                />
              </div>

              <InputField
                label="Current Invested Assets"
                value={inputs.currentSavings}
                field="currentSavings"
                min={0}
                step={1000}
                prefix="$"
              />

              <InputField
                label="Annual Spending in Retirement"
                value={inputs.annualSpending}
                field="annualSpending"
                min={0}
                step={1000}
                prefix="$"
              />

              <div className="grid md:grid-cols-3 gap-4">
                <InputField
                  label="Investment Return"
                  value={inputs.investmentReturn}
                  field="investmentReturn"
                  min={0}
                  max={20}
                  step={0.1}
                  suffix="%"
                />
                <InputField
                  label="Inflation Rate"
                  value={inputs.inflationRate}
                  field="inflationRate"
                  min={0}
                  max={10}
                  step={0.1}
                  suffix="%"
                />
                <InputField
                  label="Safe Withdrawal Rate"
                  value={inputs.safeWithdrawalRate}
                  field="safeWithdrawalRate"
                  min={1}
                  max={10}
                  step={0.1}
                  suffix="%"
                />
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Coast FIRE Analysis
            </h2>

            <div className="space-y-6">
              {/* Coast FIRE Status */}
              <div className={`p-6 rounded-xl ${
                results.isCoastFire 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-orange-50 border-2 border-orange-200'
              }`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    results.isCoastFire ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {results.isCoastFire ? '🎉 Congratulations!' : '📈 Keep Going!'}
                  </div>
                  <p className={`text-lg ${
                    results.isCoastFire ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {results.isCoastFire 
                      ? "You've reached Coast FIRE! You can stop contributing and still retire comfortably."
                      : "You're not quite at Coast FIRE yet, but you're on your way!"
                    }
                  </p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Coast FIRE Number</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(results.coastFireNumber)}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Projected at Retirement</div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(results.projectedNetWorth)}
                  </div>
                </div>
              </div>

              {!results.isCoastFire && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Shortfall</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(results.shortfall)}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Monthly Contribution Needed</div>
                    <div className="text-xl font-bold text-purple-900">
                      {formatCurrency(results.monthlyContributionNeeded)}/month
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="text-sm text-gray-600 space-y-2">
                <div>Years to retirement: {results.yearsToRetirement}</div>
                <div>Real return rate: {formatPercentage(results.realReturnRate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-8">
          <CoastFireChart data={results.projectionData} />
        </div>

        {/* Educational Content */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            What is Coast FIRE?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>Coast FIRE</strong> is a milestone in your financial independence journey where you have saved enough money that, without adding any more contributions, your investments will grow to support your retirement at a traditional retirement age.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Once you reach Coast FIRE, you have the freedom to:
              </p>
              
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Take career breaks or sabbaticals</li>
                <li>Pursue lower-paying but more fulfilling work</li>
                <li>Start your own business with less financial pressure</li>
                <li>Focus on other life goals knowing retirement is secured</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                How Coast FIRE Works
              </h3>
              
              <p className="text-gray-700 leading-relaxed">
                The calculation uses compound interest to project how your current savings will grow over time. The key factors are:
              </p>
              
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Time:</strong> Years until retirement</li>
                <li><strong>Growth Rate:</strong> Investment returns minus inflation</li>
                <li><strong>Target Amount:</strong> Based on your spending and safe withdrawal rate</li>
              </ul>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> The 4% rule suggests you can withdraw 4% of your portfolio annually in retirement. Adjust the safe withdrawal rate based on your risk tolerance and retirement timeline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}