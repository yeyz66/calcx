'use client';

import React from 'react';

const calculatorGroups = [
  {
    group: 'Scientific',
    calculators: [
      {
        name: 'Scientific Calculator',
        description: 'Advanced scientific calculator for complex calculations.',
        href: '/scientific',
      },
    ],
  },
  {
    group: 'Financial',
    calculators: [
      {
        name: 'Payment Calculator',
        description: 'Calculate loan payments, amortization schedules, and determine payoff periods for various loans.',
        href: '/payment-calculator',
      },
      {
        name: 'Land Loan Calculator',
        description: 'Calculate payments and amortization for agricultural land, farm, and rural property loans.',
        href: '/land-loan-calculator',
      },
      {
        name: 'Roth IRA Calculator',
        description: 'Estimate your Roth IRA savings and compare with a regular taxable account.',
        href: '/roth-ira-calculator',
      },
      {
        name: 'CD Calculator',
        description: 'Calculate the accumulated interest and final balance of a Certificate of Deposit (CD), including tax impact.',
        href: '/cd-calculator',
      },
      {
        name: 'Coast FIRE Calculator',
        description: 'Calculate when you have enough invested to coast to retirement without additional contributions.',
        href: '/coast-fire-calc',
      },
    ], // Placeholder for future calculators
  },
  {
    group: 'Health',
    calculators: [
      {
        name: 'ACFT Body Fat Calculator',
        description: 'Calculate U.S. Army body fat percentage and pass/fail status (2023.6.12 standard).',
        href: '/acft-calculator',
      },
      {
        name: 'IVF Due Date Calculator',
        description: 'Estimate your pregnancy due date based on IVF embryo transfer details for 3-day or 5-day transfers.',
        href: '/ivf-due-date-calculator',
      },
      {
        name: 'Period Calculator',
        description: 'Predict your future menstrual cycles and ovulation periods.',
        href: '/period-calculator',
      },
    ],
  },
  {
    group: 'Engineering',
    calculators: [
      {
        name: 'Asphalt Mass Calculator',
        description: 'Calculate the total mass of asphalt required for paving, supporting multiple unit conversions.',
        href: '/asphalt_calculator',
      },
      {
        name: 'Conduit Fill Calculator',
        description: 'Calculate conduit fill percentage per NEC® guidelines for safe electrical installations.',
        href: '/conduit-fill-calculator',
      },
    ],
  },
  {
    group: 'Weather',
    calculators: [
      {
        name: 'Dew Point Calculator',
        description: 'Estimate the dew point temperature based on air temperature and relative humidity.',
        href: '/dew-point-calculator',
      },
    ],
  },
  {
    group: 'General',
    calculators: [
      {
        name: 'Rounding Calculator',
        description: 'Round any number to your chosen precision and rounding mode instantly.',
        href: '/rounding-calculator',
      },
      {
        name: 'Time Card Calculator',
        description: 'Calculate work hours, overtime, and manage time cards efficiently.',
        href: '/time-card-calculator',
      },
      {
        name: 'Chronological Age Calculator',
        description: 'Calculate the time difference between two dates (e.g., age). Displays years, months, days, and total duration.',
        href: '/chronological-age-calculator',
      },
      {
        name: 'Era Calculator',
        description: 'Convert years between different calendar systems and historical eras (CE, BCE, Hijri, Hebrew, Buddhist).',
        href: '/era-calculator',
      },
      {
        name: 'AP Language Score Calculator',
        description: 'Calculate your estimated AP English Language exam score based on multiple-choice and essay performance.',
        href: '/ap-lang-calculator',
      },
    ],
  },
];

export default function CalculatorGroups({ search }: { search: string }) {
  const filteredGroups = calculatorGroups.map(group => ({
    ...group,
    calculators: group.calculators.filter(calc =>
      calc.name.toLowerCase().includes(search.toLowerCase()) ||
      calc.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(group => group.calculators.length > 0 || search === '');

  const groupIcons = {
    'Scientific': '🧮',
    'Financial': '💰',
    'Health': '⚡',
    'Engineering': '⚙️',
    'Weather': '🌤️',
    'General': '📊'
  };

  const groupColors = {
    'Scientific': 'from-blue-500 to-cyan-500',
    'Financial': 'from-green-500 to-emerald-500',
    'Health': 'from-red-500 to-pink-500',
    'Engineering': 'from-orange-500 to-amber-500',
    'Weather': 'from-sky-500 to-blue-500',
    'General': 'from-purple-500 to-indigo-500'
  };

  return (
    <section id="calculators">
      <div className="space-y-12">
        {filteredGroups.map(group => (
          <div key={group.group} className="group-section">
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${groupColors[group.group as keyof typeof groupColors]} flex items-center justify-center text-white text-2xl shadow-lg`}>
                {groupIcons[group.group as keyof typeof groupIcons]}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{group.group}</h2>
                <p className="text-gray-600">Specialized calculators for {group.group.toLowerCase()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.calculators.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🚧</div>
                  <div className="text-xl font-semibold text-gray-500 mb-2">Coming Soon</div>
                  <div className="text-gray-400">More calculators in development</div>
                </div>
              ) : (
                group.calculators.map(calc => (
                  <a
                    key={calc.name}
                    href={calc.href}
                    className="group block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${groupColors[group.group as keyof typeof groupColors]} flex items-center justify-center text-white text-lg shadow-md group-hover:scale-110 transition-transform`}>
                        {groupIcons[group.group as keyof typeof groupIcons]}
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-black transition-colors leading-tight">
                      {calc.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {calc.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                      Open Calculator
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        ))}
        
        {filteredGroups.length === 0 && search && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No calculators found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try searching for "payment", "body fat", "scientific", or browse all categories above.
            </p>
          </div>
        )}
      </div>
    </section>
  );
} 