'use client';

import { useState, useEffect } from 'react';
import { addDays, format } from 'date-fns';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { enUS } from 'date-fns/locale/en-US';

// Register English locale
registerLocale('en-US', enUS);
setDefaultLocale('en-US');

type TransferType = '3-day' | '5-day' | 'other' | 'donor';

export default function IvfDueDateCalculatorPage() {
  const [transferDate, setTransferDate] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [transferType, setTransferType] = useState<TransferType>('3-day');
  const [otherDays, setOtherDays] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [calculationMethod, setCalculationMethod] = useState<string>('');

  useEffect(() => {
    if (transferDate) {
      calculateDueDate();
    }
  }, [transferDate, transferType, otherDays]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Format date as YYYY-MM-DD for calculations
      const formattedDate = date.toISOString().split('T')[0];
      setTransferDate(formattedDate);
      setSelectedDate(date);
    }
  };

  const calculateDueDate = () => {
    if (!transferDate) return;

    const transferDateObj = new Date(transferDate);
    let calculatedDate;
    let method = '';

    switch (transferType) {
      case '3-day':
        calculatedDate = addDays(transferDateObj, 263);
        method = 'Added 263 days to your 3-day embryo transfer date';
        break;
      case '5-day':
        calculatedDate = addDays(transferDateObj, 261);
        method = 'Added 261 days to your 5-day embryo transfer date';
        break;
      case 'donor':
        calculatedDate = addDays(transferDateObj, 266);
        method = 'Added 266 days to your egg retrieval date';
        break;
      case 'other':
        const daysToAdd = 266 - otherDays;
        calculatedDate = addDays(transferDateObj, daysToAdd);
        method = `Added ${daysToAdd} days (266 - ${otherDays}) to your embryo transfer date`;
        break;
      default:
        calculatedDate = addDays(transferDateObj, 266);
        method = 'Standard calculation (266 days from transfer date)';
    }

    setDueDate(format(calculatedDate, 'MMMM d, yyyy'));
    setCalculationMethod(method);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateDueDate();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      <Header search="" setSearch={() => {}} />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">IVF Due Date Calculator</h1>
          <p className="text-md text-gray-600 mt-2">
            Estimate your pregnancy timeline with our IVF Due Date Calculator.
          </p>
        </header>

        {/* Calculator Section */}
        <section id="calculator" className="mb-12 p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Calculate Your Due Date</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-6 md:space-y-0">
              <div className="md:w-2/5">
                <label htmlFor="transferType" className="block text-gray-700 font-medium mb-2">
                  Embryo Transfer Type
                </label>
                <select
                  id="transferType"
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value as TransferType)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="3-day">3-Day Embryo Transfer</option>
                  <option value="5-day">5-Day Embryo Transfer</option>
                  <option value="donor">Donor Egg/Embryo (Egg Retrieval Date)</option>
                  <option value="other">Other Transfer Day</option>
                </select>
              </div>

              <div className="md:w-3/5">
                <label htmlFor="transferDate" className="block text-gray-700 font-medium mb-2">
                  {transferType === 'donor' ? 'Egg Retrieval Date' : 'Embryo Transfer Date'}
                </label>
                <DatePicker
                  id="transferDate"
                  selected={selectedDate}
                  onChange={handleDateChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="YYYY-MM-DD"
                  locale="en-US"
                  required
                />
              </div>
            </div>

            {transferType === 'other' && (
              <div>
                <label htmlFor="otherDays" className="block text-gray-700 font-medium mb-2">
                  Days Since Fertilization
                </label>
                <input
                  type="number"
                  id="otherDays"
                  min="1"
                  max="7"
                  value={otherDays}
                  onChange={(e) => setOtherDays(parseInt(e.target.value, 10))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Enter the number of days post-fertilization when your embryo was transferred.</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Calculate Due Date
            </button>
          </form>

          {dueDate && (
            <div className="mt-8 p-6 bg-blue-50 rounded-md">
              <h3 className="text-xl font-semibold text-blue-700">Your Estimated Due Date:</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">{dueDate}</p>
              <p className="text-sm text-gray-600 mt-2">
                Calculation method: {calculationMethod}
              </p>
              <p className="text-sm text-gray-600 mt-4">
                Remember, only about 4% of babies are born on their exact due date. Most babies are born within two weeks before or after this date.
              </p>
            </div>
          )}
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">How We Calculate Your IVF Due Date</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Our IVF due date calculation is based on the date of your embryo transfer. Here's a general guide:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>3-Day Embryo Transfer:</strong> We add 263 days to your transfer date (or add 266 days and subtract 3 days).</li>
              <li><strong>5-Day Embryo Transfer:</strong> We add 261 days to your transfer date (or add 266 days and subtract 5 days).</li>
              <li><strong>Donor Eggs/Embryos:</strong> If donor eggs or embryos were used, the calculation can be based on the egg retrieval date (add 266 days).</li>
              <li><strong>Other Transfer Durations:</strong> If your embryo transfer was more than 5 days post-fertilization, subtract the corresponding number of days from 266 and add that to your transfer date.</li>
            </ul>
          </div>
        </section>

        {/* Accuracy of IVF Due Dates Section */}
        <section id="accuracy" className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Understanding IVF Due Date Accuracy</h2>
          <p className="text-gray-600">
            While IVF conception is precisely timed, your baby's actual arrival may vary. Studies and community experiences show that only about 4% of babies are born on their exact due date. Your IVF due date provides a valuable estimate, but be prepared for a window around this date.
          </p>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Frequently Asked Questions (FAQ)</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700">At what week of pregnancy does IVF transfer usually occur?</h3>
              <p className="text-gray-600">This depends on the clinic and protocol, but typically, a 3-day transfer is considered to be at 2 weeks and 3 days of gestation, and a 5-day transfer at 2 weeks and 5 days of gestation, counting from a theoretical Last Menstrual Period (LMP).</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">How many weeks pregnant are you after a 5-day embryo transfer?</h3>
              <p className="text-gray-600">Immediately after a 5-day transfer, you are often considered to be about 2 weeks and 5 days pregnant in gestational terms. Your clinic will provide the most accurate dating.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Is IVF due date calculation more accurate than natural conception?</h3>
              <p className="text-gray-600">IVF due date calculation is often considered more precise because the date of conception and embryo development is known exactly, unlike in natural conception where the exact timing of fertilization may be unclear.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Can my due date change after an early ultrasound?</h3>
              <p className="text-gray-600">Yes, your healthcare provider might adjust your due date based on early ultrasound measurements, especially if there's a significant difference from the calculated date.</p>
            </div>
          </div>
        </section>

        {/* Comparison with Natural Conception Due Date Calculation */}
        <section id="comparison" className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">IVF vs. Natural Conception Due Dates</h2>
          <p className="text-gray-600">
            Unlike natural conception where due dates are often estimated from the Last Menstrual Period (LMP), conception date, or early ultrasound, IVF due dates are calculated from the known date of embryo transfer, offering a more precise starting point.
          </p>
        </section>

        {/* Related Information Section */}
        <section id="related-info">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Explore More</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <h3 className="font-medium text-blue-600">Early Pregnancy Symptoms</h3>
              <p className="text-sm text-gray-600">Learn about the common signs and symptoms in early pregnancy.</p>
            </a>
            <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <h3 className="font-medium text-blue-600">Week-by-Week Pregnancy Guide</h3>
              <p className="text-sm text-gray-600">Follow your pregnancy journey with our comprehensive week-by-week guide.</p>
            </a>
            <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <h3 className="font-medium text-blue-600">Understanding IVF</h3>
              <p className="text-sm text-gray-600">Get familiar with the IVF process, treatments, and outcomes.</p>
            </a>
            <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <h3 className="font-medium text-blue-600">Fertility Resources</h3>
              <p className="text-sm text-gray-600">Discover helpful resources for your fertility journey.</p>
            </a>
          </div>
        </section>

        <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            The information provided by this calculator is for general informational purposes only, and does not constitute medical advice. Always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health or treatment.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Our content is medically reviewed. Read more about our <a href="/privacy-policy" className="underline">editorial and medical review policies</a>.
          </p>
        </footer>
      </div>
      <Footer />
    </div>
  );
} 