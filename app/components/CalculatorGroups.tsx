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
        name: 'Roth IRA Calculator',
        description: 'Estimate your Roth IRA savings and compare with a regular taxable account.',
        href: '/roth-ira-calculator',
      },
      {
        name: 'CD Calculator',
        description: 'Calculate the accumulated interest and final balance of a Certificate of Deposit (CD), including tax impact.',
        href: '/cd-calculator',
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

  return (
    <section id="calculators">
      <div className="space-y-10">
        {filteredGroups.map(group => (
          <div key={group.group}>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{group.group} Calculators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {group.calculators.length === 0 ? (
                <div className="text-gray-400 italic">Coming soon...</div>
              ) : (
                group.calculators.map(calc => (
                  <a
                    key={calc.name}
                    href={calc.href}
                    className="block bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-lg transition group"
                  >
                    <div className="text-xl font-bold text-gray-900 mb-2 group-hover:text-black transition">{calc.name}</div>
                    <div className="text-gray-600">{calc.description}</div>
                  </a>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 