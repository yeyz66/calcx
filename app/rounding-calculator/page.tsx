import RoundingCalculator from "./components/RoundingCalculator";

export default function Page() {
  return (
    <main className="flex-1 flex flex-col items-center py-8 px-4">
      <div className="max-w-lg w-full bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <header className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Rounding Calculator</h1>
          <p className="text-gray-600 mt-2">
            Enter a number, select the precision and rounding mode, and get the rounded result instantly.
          </p>
        </header>
        <RoundingCalculator />
      </div>
    </main>
  );
} 