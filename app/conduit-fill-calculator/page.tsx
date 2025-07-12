'use client';

import { useState } from 'react';
import { conduitData, conductorData, calculateConduitFill, CalculationStandard } from './utils/conduitCalculations';

interface Conductor {
  id: string;
  type: string;
  awgSize: string;
  quantity: number;
}

export default function ConduitFillCalculator() {
  const [standard, setStandard] = useState<CalculationStandard>('NEC');
  const [conduitType, setConduitType] = useState('');
  const [conduitSize, setConduitSize] = useState('');
  const [conductors, setConductors] = useState<Conductor[]>([
    { id: '1', type: '', awgSize: '', quantity: 1 }
  ]);
  const [results, setResults] = useState<{
    fillPercentage: number;
    jamProbability: number;
    isCompliant: boolean;
    maxAllowed: number;
    standard: CalculationStandard;
  } | null>(null);

  const addConductor = () => {
    setConductors([
      ...conductors,
      { id: Date.now().toString(), type: '', awgSize: '', quantity: 1 }
    ]);
  };

  const removeConductor = (id: string) => {
    if (conductors.length > 1) {
      setConductors(conductors.filter(c => c.id !== id));
    }
  };

  const updateConductor = (id: string, field: keyof Conductor, value: string | number) => {
    setConductors(conductors.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const calculateFill = () => {
    if (!conduitType || !conduitSize || conductors.some(c => !c.type || !c.awgSize)) {
      return;
    }

    const result = calculateConduitFill(conduitType, conduitSize, conductors, standard);
    setResults(result);
  };

  const resetCalculator = () => {
    setStandard('NEC');
    setConduitType('');
    setConduitSize('');
    setConductors([{ id: '1', type: '', awgSize: '', quantity: 1 }]);
    setResults(null);
  };

  const getConduitSizes = () => {
    return conduitType ? conduitData[conduitType as keyof typeof conduitData]?.sizes || [] : [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Conduit Fill Calculator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Calculate conduit fill percentage per NEC® guidelines. Ensure safe and compliant electrical installations.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Configuration</h2>
              
              {/* Standard Selection */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calculation Standard
                  </label>
                  <select
                    value={standard}
                    onChange={(e) => setStandard(e.target.value as CalculationStandard)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="NEC">NEC (National Electrical Code)</option>
                    <option value="Utility">Utility Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conduit Type
                  </label>
                  <select
                    value={conduitType}
                    onChange={(e) => {
                      setConduitType(e.target.value);
                      setConduitSize('');
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select conduit type</option>
                    {Object.keys(conduitData).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conduit Size
                  </label>
                  <select
                    value={conduitSize}
                    onChange={(e) => setConduitSize(e.target.value)}
                    disabled={!conduitType}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select conduit size</option>
                    {getConduitSizes().map(size => (
                      <option key={size.trade} value={size.trade}>
                        {size.trade} ({size.internal}" ID)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conductors */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Conductors</h3>
                  <button
                    onClick={addConductor}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Conductor
                  </button>
                </div>

                <div className="space-y-4">
                  {conductors.map((conductor, index) => (
                    <div key={conductor.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-medium text-gray-700">Conductor {index + 1}</span>
                        {conductors.length > 1 && (
                          <button
                            onClick={() => removeConductor(conductor.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Wire Type
                          </label>
                          <select
                            value={conductor.type}
                            onChange={(e) => updateConductor(conductor.id, 'type', e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select type</option>
                            {Object.keys(conductorData).map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            AWG Size
                          </label>
                          <select
                            value={conductor.awgSize}
                            onChange={(e) => updateConductor(conductor.id, 'awgSize', e.target.value)}
                            disabled={!conductor.type}
                            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                          >
                            <option value="">Select size</option>
                            {conductor.type && conductorData[conductor.type as keyof typeof conductorData] && 
                              Object.keys(conductorData[conductor.type as keyof typeof conductorData]).map(size => (
                                <option key={size} value={size}>{size} AWG</option>
                              ))
                            }
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={conductor.quantity}
                            onChange={(e) => updateConductor(conductor.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={calculateFill}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Calculate Fill
                </button>
                <button
                  onClick={resetCalculator}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Results</h2>
              
              {results ? (
                <div className="space-y-6">
                  {/* Fill Percentage */}
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="10"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke={results.isCompliant ? "#10b981" : "#ef4444"}
                          strokeWidth="10"
                          strokeDasharray={`${results.fillPercentage * 3.14} 314`}
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {results.fillPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-gray-900">Conduit Fill</p>
                  </div>

                  {/* Compliance Status */}
                  <div className={`p-4 rounded-lg ${results.isCompliant ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${results.isCompliant ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`font-medium ${results.isCompliant ? 'text-green-800' : 'text-red-800'}`}>
                        {results.isCompliant ? `${results.standard} Compliant` : `Exceeds ${results.standard} Limits`}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${results.isCompliant ? 'text-green-700' : 'text-red-700'}`}>
                      Maximum allowed ({results.standard}): {results.maxAllowed.toFixed(1)}%
                    </p>
                  </div>

                  {/* Jam Probability */}
                  {results.jamProbability > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Jam Probability</h4>
                      <div className="flex items-center">
                        <div className="flex-1 bg-yellow-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${results.jamProbability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-yellow-800">
                          {results.jamProbability.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-2">
                        Probability of cables jamming during installation
                      </p>
                    </div>
                  )}

                  {/* Standard Reference */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      {results.standard === 'NEC' ? 'NEC® Reference' : 'Utility Standard Reference'}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {results.standard === 'NEC' 
                        ? 'Calculations based on NEC Table 1 (Chapter 9) and Article 352 for conduit fill requirements. Includes 5% bend factor adjustment.'
                        : 'Calculations based on utility industry standards with conservative fill percentages. Includes 5% bend factor adjustment.'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    Configure your conduit and conductors, then click "Calculate Fill" to see results.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}