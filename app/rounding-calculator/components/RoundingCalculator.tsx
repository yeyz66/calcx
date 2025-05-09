"use client";
import React, { useState } from "react";

const ROUNDING_MODES = [
  { label: "Round to the nearest (default)", value: "nearest-default" },
  { label: "Round half up", value: "half-up-img" },
  { label: "Round half down", value: "half-down-img" },
  { label: "Round up (ceiling)", value: "up-ceil" },
  { label: "Round down (floor)", value: "down-floor" },
  { label: "Round half to even", value: "half-even" },
  { label: "Round half to odd", value: "half-odd" },
  { label: "Round half away from zero", value: "half-away-zero" },
  { label: "Round half towards zero", value: "half-towards-zero" },
];

const DECIMAL_PRECISION_OPTIONS = [
  { label: "0 decimal places (integer)", value: "0" },
  { label: "1 decimal place", value: "1" },
  { label: "2 decimal places", value: "2" },
  { label: "3 decimal places", value: "3" },
  { label: "4 decimal places", value: "4" },
];

const FRACTIONAL_PRECISION_OPTIONS = [
  { label: "1/2", value: "1/2" },
  { label: "1/4", value: "1/4" },
  { label: "1/8", value: "1/8" },
  { label: "1/16", value: "1/16" },
  { label: "1/32", value: "1/32" },
  { label: "1/64", value: "1/64" },
];

const CUSTOM_PRECISION_OPTION = { label: "Custom (decimal places)", value: "custom" };

const EPSILON = 1e-9; // For floating point comparisons

// Helper function to calculate Greatest Common Divisor (GCD)
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

interface FormattedFraction {
  type: "whole" | "fraction" | "mixed";
  sign: string;
  value?: number; // For whole numbers
  integer?: number; // For mixed fractions
  numerator?: number;
  denominator?: number;
}

function formatAsMixedFraction(value: number, denominatorInput: number): FormattedFraction {
  const sign = value < 0 ? "-" : "";
  const absValue = Math.abs(value);

  if (Math.abs(absValue % 1) < EPSILON && Math.abs(denominatorInput) > 0) {
    if (sign === "-" && absValue === 0) return { type: "whole", value: 0, sign: "" }; // Handle -0 case
    return { type: "whole", value: absValue, sign };
  }

  const integerPart = Math.floor(absValue);
  const fractionalPartDecimal = absValue - integerPart;

  if (Math.abs(fractionalPartDecimal) < EPSILON) {
    if (sign === "-" && integerPart === 0) return { type: "whole", value: 0, sign: "" };
    return { type: "whole", value: integerPart, sign };
  }

  let numerator = Math.round(fractionalPartDecimal * denominatorInput);
  let currentDenominator = denominatorInput;

  if (numerator === 0) {
    if (sign === "-" && integerPart === 0) return { type: "whole", value: 0, sign: "" };
    return { type: "whole", value: integerPart, sign };
  }

  if (numerator === currentDenominator) {
    return { type: "whole", value: integerPart + 1, sign };
  }

  const commonDivisor = gcd(numerator, currentDenominator);
  numerator /= commonDivisor;
  currentDenominator /= commonDivisor;

  if (integerPart === 0) {
    return { type: "fraction", numerator, denominator: currentDenominator, sign };
  }
  return { type: "mixed", integer: integerPart, numerator, denominator: currentDenominator, sign };
}

function roundNumber(value: number, precisionVal: number, mode: string, isFractional: boolean): number {
  const factor = isFractional ? precisionVal : Math.pow(10, precisionVal);
  if (factor === 0 && isFractional) return value; 
  if (factor === 0 && !isFractional && precisionVal !==0 ) return value; 

  const scaledValue = value * factor;
  let resultScaled;
  const fractionalPart = scaledValue - Math.trunc(scaledValue);
  const isHalf = Math.abs(Math.abs(fractionalPart) - 0.5) < EPSILON;

  switch (mode) {
    case "nearest-default": 
    case "half-up-img":     
      resultScaled = Math.round(scaledValue);
      break;
    case "half-down-img": 
      if (isHalf) {
        resultScaled = Math.floor(scaledValue);
      } else {
        resultScaled = Math.round(scaledValue);
      }
      break;
    case "up-ceil": 
      resultScaled = Math.ceil(scaledValue);
      break;
    case "down-floor": 
      resultScaled = Math.floor(scaledValue);
      break;
    case "half-even": 
      if (isHalf) {
        const floorVal = Math.floor(scaledValue);
        const ceilVal = Math.ceil(scaledValue);
        resultScaled = (Math.abs(Math.round(floorVal) % 2) < EPSILON) ? floorVal : ceilVal;
      } else {
        resultScaled = Math.round(scaledValue);
      }
      break;
    case "half-odd": 
      if (isHalf) {
        const floorVal = Math.floor(scaledValue);
        const ceilVal = Math.ceil(scaledValue);
        resultScaled = (Math.abs(Math.round(floorVal) % 2) > EPSILON) ? floorVal : ceilVal;
      } else {
        resultScaled = Math.round(scaledValue);
      }
      break;
    case "half-away-zero": 
      if (isHalf) {
        resultScaled = scaledValue >= 0 ? Math.ceil(scaledValue) : Math.floor(scaledValue);
      } else {
        resultScaled = Math.round(scaledValue);
      }
      break;
    case "half-towards-zero": 
      if (isHalf) {
        resultScaled = scaledValue >= 0 ? Math.floor(scaledValue) : Math.ceil(scaledValue);
      } else {
        resultScaled = Math.round(scaledValue);
      }
      break;
    default:
      resultScaled = scaledValue; 
  }
  return resultScaled / factor;
}

const roundingModeDetails = [
  {
    value: "nearest-default",
    label: "Round to the nearest (default)",
    introduction: "This mode rounds numbers to the closest integer. When a number is exactly halfway between two integers (e.g., 2.5), this mode, mirroring JavaScript\'s `Math.round()`, typically rounds towards positive infinity. Thus, 2.5 becomes 3, and -2.5 becomes -2.",
    examples: [
      "Input: 2.3 (to 0 decimals)  => Output: 2",
      "Input: 2.7 (to 0 decimals)  => Output: 3",
      "Input: 2.5 (to 0 decimals)  => Output: 3",
      "Input: -2.5 (to 0 decimals) => Output: -2",
    ],
    commonScenarios: "General-purpose rounding, often the default behavior in many programming environments for basic rounding tasks. Suitable when a simple and consistent tie-breaking rule (halves towards positive infinity) is acceptable.",
  },
  {
    value: "half-up-img",
    label: "Round half up",
    introduction: "This mode rounds numbers to the closest integer. If a number is exactly halfway between two integers, it rounds up (towards positive infinity). For example, 2.5 rounds to 3, and -2.5 rounds to -2 (as \'up\' here means towards positive infinity).",
    examples: [
      "Input: 7.5 (to 0 decimals)  => Output: 8",
      "Input: 7.2 (to 0 decimals)  => Output: 7",
      "Input: -7.5 (to 0 decimals) => Output: -7",
    ],
    commonScenarios: "Frequently used in academic grading and general calculations where halves should consistently round towards a numerically larger value (or less negative value).",
  },
  {
    value: "half-down-img",
    label: "Round half down",
    introduction: "This mode rounds numbers to the closest integer. If a number is exactly halfway between two integers, it rounds down (towards negative infinity). For example, 2.5 rounds to 2, and -2.5 rounds to -3.",
    examples: [
      "Input: 3.5 (to 0 decimals)  => Output: 3",
      "Input: 3.7 (to 0 decimals)  => Output: 4",
      "Input: -3.5 (to 0 decimals) => Output: -4",
    ],
    commonScenarios: "Used in situations where a conservative rounding approach is needed for tie-breaking, ensuring that half-values resolve to the numerically lower value. It can be specified in particular standards or requirements.",
  },
  {
    value: "up-ceil",
    label: "Round up (ceiling)",
    introduction: "This mode always rounds the number to the next integer in the direction of positive infinity, unless it\'s already an integer. For example, 2.1 rounds to 3, and -2.9 rounds to -2.",
    examples: [
      "Input: 4.1 (to 0 decimals)  => Output: 5",
      "Input: -4.9 (to 0 decimals) => Output: -4",
      "Input: 4.0 (to 0 decimals)  => Output: 4",
    ],
    commonScenarios: "Ensuring a minimum quantity (e.g., number of buses, inventory levels) or in pricing items sold in discrete units where any fraction of a unit incurs the full unit cost.",
  },
  {
    value: "down-floor",
    label: "Round down (floor)",
    introduction: "This mode always rounds the number to the previous integer in the direction of negative infinity, unless it\'s already an integer. For example, 2.9 rounds to 2, and -2.1 rounds to -3.",
    examples: [
      "Input: 5.9 (to 0 decimals)  => Output: 5",
      "Input: -5.1 (to 0 decimals) => Output: -6",
      "Input: 5.0 (to 0 decimals)  => Output: 5",
    ],
    commonScenarios: "Calculating completed units (e.g., age in full years), determining how many full items can be obtained within a budget, or in array indexing.",
  },
  {
    value: "half-even",
    label: "Round half to even (Banker\'s Rounding)",
    introduction: "This mode rounds numbers to the closest integer. If a number is exactly halfway between two integers, it rounds to the nearest even integer (e.g., 2.5 to 2, 3.5 to 4). This method minimizes long-term bias.",
    examples: [
      "Input: 2.5 (to 0 decimals)  => Output: 2",
      "Input: 3.5 (to 0 decimals)  => Output: 4",
      "Input: -2.5 (to 0 decimals) => Output: -2",
    ],
    commonScenarios: "Widely adopted in financial, statistical, and scientific calculations (e.g., IEEE 754 standard) to reduce cumulative rounding errors. Ideal for accounting and data analysis.",
  },
  {
    value: "half-odd",
    label: "Round half to odd",
    introduction: "This mode rounds numbers to the closest integer. If a number is exactly halfway between two integers, it rounds to the nearest odd integer (e.g., 2.5 to 3, 3.5 to 3).",
    examples: [
      "Input: 2.5 (to 0 decimals)  => Output: 3",
      "Input: 4.5 (to 0 decimals)  => Output: 5",
      "Input: -2.5 (to 0 decimals) => Output: -3", 
    ],
    commonScenarios: "Less common in standard applications but can be employed in specific algorithms or custom numerical processes where this particular tie-breaking behavior is desired.",
  },
  {
    value: "half-away-zero",
    label: "Round half away from zero",
    introduction: "This mode rounds to the closest integer. If a number is exactly halfway, it rounds away from zero (e.g., 2.5 to 3, -2.5 to -3). Positive halves round up; negative halves round down in value.",
    examples: [
      "Input: 2.5 (to 0 decimals)  => Output: 3",
      "Input: -2.5 (to 0 decimals) => Output: -3",
      "Input: 2.3 (to 0 decimals)  => Output: 2",
    ],
    commonScenarios: "Often taught in primary education due to its symmetrical handling of positive and negative halves. Used in some financial contexts when an intuitive \'larger magnitude for halves\' rule is preferred.",
  },
  {
    value: "half-towards-zero",
    label: "Round half towards zero",
    introduction: "This mode rounds to the closest integer. If a number is exactly halfway, it rounds towards zero (e.g., 2.5 to 2, -2.5 to -2). Positive halves round down; negative halves round up in value.",
    examples: [
      "Input: 2.5 (to 0 decimals)  => Output: 2",
      "Input: -2.5 (to 0 decimals) => Output: -2",
      "Input: 2.8 (to 0 decimals)  => Output: 3",
    ],
    commonScenarios: "Used when a bias towards zero is desired for tie-breaking situations. This is effectively truncation for values that are exact halves, while non-halves are rounded to the nearest.",
  },
];

// Define a type for the displayResult state
type DisplayResultType = string | FormattedFraction;

export default function RoundingCalculator() {
  const [input, setInput] = useState("");
  const [precision, setPrecision] = useState<string>("2");
  const [customPrecision, setCustomPrecision] = useState("");
  const [mode, setMode] = useState("nearest-default");

  const parsedInput = parseFloat(input);
  const isValidNumber = !isNaN(parsedInput) && Number.isFinite(parsedInput);
  
  let finalPrecisionValue = 0;
  let isFractionalPrecision = false;
  let selectedDenominator = 0; // To store the denominator for fractional display

  if (precision === "custom") {
    const parsedCustom = parseInt(customPrecision);
    if (!isNaN(parsedCustom) && parsedCustom >= 0 && parsedCustom <= 20) {
      finalPrecisionValue = parsedCustom;
    } else {
      finalPrecisionValue = 0; 
    }
    isFractionalPrecision = false;
  } else if (precision.includes('/')) { 
    const parts = precision.split('/');
    const denominator = parseInt(parts[1]);
    if (parts.length === 2 && parts[0] === '1' && !isNaN(denominator) && denominator > 0) {
      finalPrecisionValue = denominator;
      selectedDenominator = denominator; // Store for display
      isFractionalPrecision = true;
    } else {
      finalPrecisionValue = 0; 
      isFractionalPrecision = false;
    }
  } else { 
    const parsedDecimal = parseInt(precision);
    if(!isNaN(parsedDecimal)){
      finalPrecisionValue = parsedDecimal;
    } else {
      finalPrecisionValue = 0; 
    }
    isFractionalPrecision = false;
  }

  const numericResult = isValidNumber ? roundNumber(parsedInput, finalPrecisionValue, mode, isFractionalPrecision) : NaN;
  
  let currentDisplayResult: DisplayResultType;
  if (isValidNumber) {
    if (isFractionalPrecision && selectedDenominator > 0) {
      currentDisplayResult = formatAsMixedFraction(numericResult, selectedDenominator);
    } else {
      // Format decimal result to the specified number of decimal places
      // Convert to number to remove trailing zeros from toFixed if it's a whole number after rounding
      currentDisplayResult = { type: "whole", value: Number(numericResult.toFixed(finalPrecisionValue)), sign: "" };
      // Correctly handle sign for FormattedFraction when it's a whole number from decimal precision
      if (numericResult < 0 && currentDisplayResult.value !== 0) currentDisplayResult.sign = "-";
      currentDisplayResult.value = Math.abs(currentDisplayResult.value as number);
    }
  } else if (input.trim() !== "") {
    currentDisplayResult = "Please enter a valid number.";
  } else {
    currentDisplayResult = "Enter a number";
  }

  const isCustomPrecisionMode = precision === "custom";

  const renderFraction = (fractionData: DisplayResultType) => {
    if (typeof fractionData === 'string') return fractionData; // Error messages

    const { type, sign, value, integer, numerator, denominator } = fractionData as FormattedFraction;

    return (
      <>
        {sign}
        {type === 'whole' && value?.toString()}
        {type === 'mixed' && <span className="align-middle">{integer}</span>}
        {(type === 'mixed' || type === 'fraction') && numerator !== undefined && denominator !== undefined && (
          <span className={`inline-flex flex-col text-center align-middle ${type === 'mixed' ? 'ml-1' : ''}`} style={{lineHeight: '1', verticalAlign: 'middle'}}>
            <span className="block leading-tight">{numerator}</span>
            <span className="block border-t border-current leading-tight">{denominator}</span>
          </span>
        )}
      </>
    );
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="number-input" className="block text-sm font-medium text-gray-700">
          Number to round:
        </label>
        <input
          id="number-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter a number (e.g., 3.14159)"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="precision-select" className="block text-sm font-medium text-gray-700">
          Round to nearest:
        </label>
        <div className="flex items-center space-x-2">
          <select
            id="precision-select"
            value={precision}
            onChange={e => {
              const val = e.target.value;
              setPrecision(val);
              if (val === "custom") {
                setCustomPrecision(""); 
              }
            }}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm flex-grow"
          >
            {DECIMAL_PRECISION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            {FRACTIONAL_PRECISION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            <option value={CUSTOM_PRECISION_OPTION.value}>{CUSTOM_PRECISION_OPTION.label}</option>
          </select>
          {isCustomPrecisionMode && (
            <input
              type="number"
              min="0"
              max="20"
              value={customPrecision}
              onChange={e => setCustomPrecision(e.target.value)}
              placeholder="Decimals"
              className="mt-1 block w-auto px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              aria-label="Custom decimal places"
              style={{ width: '100px' }}
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="mode-select" className="block text-sm font-medium text-gray-700">
          Rounding mode:
        </label>
        <select
          id="mode-select"
          value={mode}
          onChange={e => setMode(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {ROUNDING_MODES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Result:</h2>
        <p className={`text-2xl font-bold mt-2 ${isValidNumber && typeof currentDisplayResult !== 'string' ? 'text-indigo-600' : 'text-red-500'}`}>
          {renderFraction(currentDisplayResult)}
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-300 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Understanding Rounding Modes & Precision</h2>
        
        <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Rounding to Fractions (Precision)</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Beyond standard decimal place rounding, this calculator also allows you to round numbers to the nearest common fraction, such as 1/2, 1/4, 1/8, 1/16, 1/32, or 1/64. When you select a fractional precision, the calculator determines which of these fractional increments your input number is closest to.
          </p>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            For example, if you round 3.3 to the nearest 1/4, it will result in 3 1/4 (which is 3.25), as 3.3 is closer to 3.25 than to 3.50 (3 2/4). The selected rounding mode (e.g., Round half up, Round half to even) is then applied if the number is exactly halfway between two such fractional steps, using the chosen mode&apos;s tie-breaking rule relative to those fractional increments.
          </p>
        </div>

        {roundingModeDetails.map((modeDetail) => (
          <div key={modeDetail.value} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">{modeDetail.label}</h3>
            <p className="text-sm text-gray-600 mb-2 leading-relaxed"><strong>Introduction:</strong> {modeDetail.introduction}</p>
            <div className="mb-2">
              <p className="text-sm text-gray-600 font-semibold">Examples (typically at 0 decimal places for tie-breaking illustration):</p>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1 mt-1">
                {modeDetail.examples.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed"><strong>Common Scenarios:</strong> {modeDetail.commonScenarios}</p>
          </div>
        ))}
      </div>
    </section>
  );
} 