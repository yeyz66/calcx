'use client';
import React, { useState } from 'react';
import { calculateFutureCycles, CyclePrediction, formatDate } from './utils/calculations';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PeriodCalculatorPage = () => {
  const [lastPeriodDate, setLastPeriodDate] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [periodDuration, setPeriodDuration] = useState<number>(5);
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [predictions, setPredictions] = useState<CyclePrediction[]>([]);
  const [search, setSearch] = useState('');

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Format date as YYYY-MM-DD for our calculations
      const formattedDate = date.toISOString().split('T')[0];
      setLastPeriodDate(formattedDate);
      setSelectedDate(date);
    }
  };

  const handleCalculate = () => {
    if (!lastPeriodDate || periodDuration <= 0 || cycleLength <= 0) {
      // Basic validation
      setPredictions([]);
      return;
    }
    const futureCycles = calculateFutureCycles(lastPeriodDate, periodDuration, cycleLength);
    setPredictions(futureCycles);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      <Header search={search} setSearch={setSearch} />
      <div className="container mx-auto p-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">Period Calculator</h1>
          <p className="text-lg text-gray-600">Predict your future menstrual cycles and ovulation periods.</p>
        </header>

        {/* User Input Section */}
        <section className="mb-8 p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Your Details</h2>
          <div className="grid grid-cols-1 gap-4 mb-4 max-w-md mx-auto">
            <div>
              <label htmlFor="lastPeriodDate" className="block text-sm font-medium text-gray-700 mb-1">First Day of Last Period:</label>
              <DatePicker
                id="lastPeriodDate"
                selected={selectedDate}
                onChange={handleDateChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer"
                dateFormat="yyyy-MM-dd"
                placeholderText="YYYY-MM-DD"
                locale="en-US"
              />
            </div>
            <div>
              <label htmlFor="periodDuration" className="block text-sm font-medium text-gray-700 mb-1">Period Duration (days):</label>
              <input
                type="number"
                id="periodDuration"
                value={periodDuration}
                min="1"
                onChange={(e) => setPeriodDuration(parseInt(e.target.value, 10))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="cycleLength" className="block text-sm font-medium text-gray-700 mb-1">Average Cycle Length (days):</label>
              <input
                type="number"
                id="cycleLength"
                value={cycleLength}
                min="15" // A reasonable minimum
                onChange={(e) => setCycleLength(parseInt(e.target.value, 10))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="max-w-md mx-auto text-center">
            <button
              onClick={handleCalculate}
              disabled={!lastPeriodDate}
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-indigo-700 hover:shadow-lg focus:bg-indigo-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-indigo-800 active:shadow-lg transition duration-150 ease-in-out disabled:bg-gray-400"
            >
              Calculate
            </button>
          </div>
        </section>

        {/* Results Section */}
        <section className="mb-8 p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Predictions</h2>
          {predictions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Period Dates</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Fertile Window</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Ovulation Day</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictions.map((cycle) => (
                    <tr key={cycle.cycleNumber}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cycle.cycleNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(cycle.periodStartDate)} - {formatDate(cycle.periodEndDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(cycle.fertileWindowStartDate)} - {formatDate(cycle.fertileWindowEndDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(cycle.ovulationDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Please enter your details and click "Calculate" to see your predictions.</p>
          )}
        </section>

        {/* Educational Information Section */}
        <section className="p-6 bg-gray-50 shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Understanding Your Cycle</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="text-lg font-semibold">The Menstrual Cycle</h3>
              <p>
                The menstrual cycle is a monthly series of changes a woman's body goes through in preparation for the possibility of pregnancy. 
                Each month, one of the ovaries releases an egg — a process called ovulation. At the same time, hormonal changes prepare the uterus for pregnancy. 
                If ovulation takes place and the egg isn't fertilized, the lining of the uterus sheds through the vagina. This is a menstrual period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Menstrual Period</h3>
              <p>
                A menstrual period is the shedding of the uterine lining. Periods can last from 2 to 7 days, though this varies from person to person and month to month. 
                The length of your period is one of the inputs for this calculator to help predict future cycles.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ovulation</h3>
              <p>
                Ovulation is when a mature egg is released from the ovary. The egg then moves down the fallopian tube where it can be fertilized. 
                If sperm are in the fallopian tube when the egg is released, there is a good chance that the egg will be fertilized, creating an embryo, which can grow into a baby.
                Ovulation typically occurs about 14 days before the start of the next menstrual period, but this can vary.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Fertile Window</h3>
              <p>
                The fertile window is the time in your menstrual cycle when pregnancy is possible. It typically includes the 5 days before ovulation and the day of ovulation itself. 
                Sperm can survive in the female reproductive tract for up to 5 days, so intercourse during this window can lead to pregnancy.
                This calculator estimates your fertile window based on your cycle length and ovulation day.
              </p>
            </div>
             <div>
              <p className="text-sm text-gray-500 mt-4">
                <strong>Disclaimer:</strong> This calculator provides an estimation and should not be used as a form of birth control or for medical diagnosis. 
                Cycle lengths and ovulation can vary. For accurate information, please consult a healthcare provider.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default PeriodCalculatorPage; 