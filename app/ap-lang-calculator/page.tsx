'use client';

import { useState } from 'react';

interface ScoreResult {
  totalScore: number;
  apScore: number;
  percentile: string;
}

const AP_SCORE_RANGES = {
  2025: [
    { min: 104, max: 150, score: 5 },
    { min: 88, max: 103, score: 4 },
    { min: 69, max: 87, score: 3 },
    { min: 49, max: 68, score: 2 },
    { min: 0, max: 48, score: 1 }
  ],
  2020: [
    { min: 107, max: 150, score: 5 },
    { min: 90, max: 106, score: 4 },
    { min: 71, max: 89, score: 3 },
    { min: 51, max: 70, score: 2 },
    { min: 0, max: 50, score: 1 }
  ],
  2007: [
    { min: 104, max: 150, score: 5 },
    { min: 87, max: 103, score: 4 },
    { min: 67, max: 86, score: 3 },
    { min: 46, max: 66, score: 2 },
    { min: 0, max: 45, score: 1 }
  ]
};

export default function APLangCalculator() {
  const [mcqScore, setMcqScore] = useState<number>(0);
  const [synthesisScore, setSynthesisScore] = useState<number>(0);
  const [rhetoricalScore, setRhetoricalScore] = useState<number>(0);
  const [argumentScore, setArgumentScore] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<keyof typeof AP_SCORE_RANGES>(2025);
  const [result, setResult] = useState<ScoreResult | null>(null);

  const calculateScore = () => {
    // Convert FRQ scores to weighted points (each essay is worth 18.75% of total, MCQ is 45%)
    const frqTotal = (synthesisScore + rhetoricalScore + argumentScore) * 3.125; // (18/6) * 3.125 = 18.75% each
    const mcqTotal = mcqScore * 1.333; // 45/45 * 60 = 1.333 multiplier for 60 points max
    
    const totalScore = Math.round(mcqTotal + frqTotal);
    
    const scoreRanges = AP_SCORE_RANGES[selectedYear];
    let apScore = 1;
    
    for (const range of scoreRanges) {
      if (totalScore >= range.min && totalScore <= range.max) {
        apScore = range.score;
        break;
      }
    }

    let percentile = '';
    if (apScore === 5) percentile = '~9.8%';
    else if (apScore === 4) percentile = '~18.3%';
    else if (apScore === 3) percentile = '~28.1%';
    else if (apScore === 2) percentile = '~25.8%';
    else percentile = '~18.0%';

    setResult({
      totalScore,
      apScore,
      percentile
    });
  };

  const resetCalculator = () => {
    setMcqScore(0);
    setSynthesisScore(0);
    setRhetoricalScore(0);
    setArgumentScore(0);
    setResult(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score === 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            AP English Language Score Calculator
          </h1>
          <p className="text-gray-600 mb-8">
            Calculate your estimated AP English Language exam score based on your performance in each section.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Score Conversion Year
                </label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value) as keyof typeof AP_SCORE_RANGES)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2025}>2025</option>
                  <option value={2020}>2020</option>
                  <option value={2007}>2007</option>
                </select>
              </div>

              <div>
                <label htmlFor="mcq" className="block text-sm font-medium text-gray-700 mb-2">
                  Section I: Multiple Choice (0-45)
                </label>
                <input
                  type="number"
                  id="mcq"
                  min="0"
                  max="45"
                  value={mcqScore}
                  onChange={(e) => setMcqScore(Math.min(45, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Number of correct answers"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Section II: Free Response Essays</h3>
                
                <div>
                  <label htmlFor="synthesis" className="block text-sm font-medium text-gray-700 mb-2">
                    Synthesis Question (0-6)
                  </label>
                  <input
                    type="number"
                    id="synthesis"
                    min="0"
                    max="6"
                    value={synthesisScore}
                    onChange={(e) => setSynthesisScore(Math.min(6, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Score out of 6"
                  />
                </div>

                <div>
                  <label htmlFor="rhetorical" className="block text-sm font-medium text-gray-700 mb-2">
                    Rhetorical Analysis Question (0-6)
                  </label>
                  <input
                    type="number"
                    id="rhetorical"
                    min="0"
                    max="6"
                    value={rhetoricalScore}
                    onChange={(e) => setRhetoricalScore(Math.min(6, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Score out of 6"
                  />
                </div>

                <div>
                  <label htmlFor="argument" className="block text-sm font-medium text-gray-700 mb-2">
                    Argument Question (0-6)
                  </label>
                  <input
                    type="number"
                    id="argument"
                    min="0"
                    max="6"
                    value={argumentScore}
                    onChange={(e) => setArgumentScore(Math.min(6, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Score out of 6"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={calculateScore}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  Calculate Score
                </button>
                <button
                  onClick={resetCalculator}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {result && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Estimated Score</h3>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getScoreColor(result.apScore)}`}>
                        {result.apScore}
                      </div>
                      <div className="text-gray-600 mt-2">AP Score</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-gray-800">{result.totalScore}</div>
                        <div className="text-gray-600">Composite Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-gray-800">{result.percentile}</div>
                        <div className="text-gray-600">of test takers</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">AP Score Meanings</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium text-green-600">5:</span> Extremely well qualified</div>
                  <div><span className="font-medium text-green-600">4:</span> Well qualified</div>
                  <div><span className="font-medium text-yellow-600">3:</span> Qualified</div>
                  <div><span className="font-medium text-red-600">2:</span> Possibly qualified</div>
                  <div><span className="font-medium text-red-600">1:</span> No recommendation</div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Important Notes</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• This is an estimate based on historical scoring patterns</li>
                  <li>• Actual scores may vary due to curve adjustments</li>
                  <li>• Only 9.8% of test takers scored a 5 in 2024</li>
                  <li>• Average AP English Language score is around 2.86</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}