'use client';
import React, { useState, useEffect, useRef } from 'react';
import { evaluate, format, pi, e as mathE, sin, cos, tan, asin, acos, atan, log, sqrt, pow, random, factorial } from 'mathjs';

const buttons = [
  ['sin', 'cos', 'tan', 'Deg', 'Rad', '7', '8', '9', '+', 'Back'],
  ['sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'π', 'e', '4', '5', '6', '−', 'Ans'],
  ['xʸ', 'x³', 'x²', 'eˣ', '10ˣ', '1', '2', '3', '×', 'M+'],
  ['y√x', '³√x', '√x', 'ln', 'log', '0', '.', 'EXP', '/', 'M-'],
  ['(', ')', '1/x', '%', 'n!', '±', 'RND', 'AC', '=', 'MR'],
];

type HistoryItem = { expression: string; result: string };

export default function ScientificCalculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [memory, setMemory] = useState(0);
  const [lastAnswer, setLastAnswer] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('sci-calc-history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sci-calc-history', JSON.stringify(history));
  }, [history]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!calculatorRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await calculatorRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  function toRad(val: number) {
    return angleMode === 'DEG' ? (val * Math.PI) / 180 : val;
  }
  function toDeg(val: number) {
    return angleMode === 'DEG' ? (val * 180) / Math.PI : val;
  }

  function handleClick(val: string) {
    if (val === 'Deg') setAngleMode('DEG');
    else if (val === 'Rad') setAngleMode('RAD');
    else if (val === 'AC') {
      setExpression(''); setResult('');
    } else if (val === 'Back') {
      setExpression(expression.slice(0, -1));
    } else if (val === '=') {
      const evalResult = evaluateExpression(expression);
      setResult(evalResult);
      setLastAnswer(evalResult);
      if (
        evalResult !== 'Error' &&
        expression.trim() !== '' &&
        (history.length === 0 || history[0].expression !== expression || history[0].result !== evalResult)
      ) {
        setHistory([{ expression, result: evalResult }, ...history].slice(0, 20));
      }
    } else if (val === 'Ans') {
      setExpression(expression + lastAnswer);
    } else if (val === 'MR') {
      setExpression(expression + memory.toString());
    } else if (val === 'M+') {
      setMemory(memory + Number(result || 0));
    } else if (val === 'M-') {
      setMemory(memory - Number(result || 0));
    } else if (val === 'π') {
      setExpression(expression + pi.toString());
    } else if (val === 'e') {
      setExpression(expression + mathE.toString());
    } else if (val === '±') {
      if (expression) setExpression(expression.startsWith('-') ? expression.slice(1) : '-' + expression);
    } else if (val === 'RND') {
      setExpression(expression + random().toString());
    } else if (val === 'sin' || val === 'cos' || val === 'tan') {
      setExpression(expression + val + '(');
    } else if (val === 'sin⁻¹') {
      setExpression(expression + 'asin(');
    } else if (val === 'cos⁻¹') {
      setExpression(expression + 'acos(');
    } else if (val === 'tan⁻¹') {
      setExpression(expression + 'atan(');
    } else if (val === 'ln') {
      setExpression(expression + 'log(');
    } else if (val === 'log') {
      setExpression(expression + 'log10(');
    } else if (val === 'xʸ') {
      setExpression(expression + '^');
    } else if (val === 'x²') {
      setExpression(expression + '^2');
    } else if (val === 'x³') {
      setExpression(expression + '^3');
    } else if (val === 'eˣ') {
      setExpression(expression + 'e^');
    } else if (val === '10ˣ') {
      setExpression(expression + '10^');
    } else if (val === '√x') {
      setExpression(expression + 'sqrt(');
    } else if (val === '³√x') {
      setExpression(expression + 'cbrt(');
    } else if (val === 'y√x') {
      setExpression(expression + 'root(');
    } else if (val === '1/x') {
      setExpression(expression + '1/(');
    } else if (val === 'n!') {
      setExpression(expression + '!');
    } else if (val === 'EXP') {
      setExpression(expression + 'E');
    } else {
      setExpression(expression + val);
    }
  }

  function evaluateExpression(expr: string): string {
    try {
      // 替换三角函数为 mathjs 支持的表达式，并替换常见运算符
      const parsed = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/sin\(/g, angleMode === 'DEG' ? 'sin(toRad(' : 'sin(')
        .replace(/cos\(/g, angleMode === 'DEG' ? 'cos(toRad(' : 'cos(')
        .replace(/tan\(/g, angleMode === 'DEG' ? 'tan(toRad(' : 'tan(')
        .replace(/asin\(/g, angleMode === 'DEG' ? 'toDeg(asin(' : 'asin(')
        .replace(/acos\(/g, angleMode === 'DEG' ? 'toDeg(acos(' : 'acos(')
        .replace(/atan\(/g, angleMode === 'DEG' ? 'toDeg(atan(' : 'atan(')
        .replace(/log10\(/g, 'log10(')
        .replace(/log\(/g, 'log(')
        .replace(/cbrt\(/g, 'cbrt(')
        .replace(/root\(/g, 'root(');
      // 注入 toRad/toDeg
      const scope = { toRad, toDeg, pi, e: mathE, sqrt, cbrt: (x: number) => Math.cbrt(x), root: (x: number, y: number) => Math.pow(x, 1/y), log10: (x: number) => Math.log10(x), log, sin, cos, tan, asin, acos, atan, pow, random, factorial };
      const result = evaluate(parsed, scope);
      if (typeof result === 'number' && isFinite(result)) {
        return format(result, { precision: 12 });
      }
      return 'Error';
    } catch {
      return 'Error';
    }
  }

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('sci-calc-history');
  };

  return (
    <section 
      ref={calculatorRef}
      className={`w-full mx-auto transition-all duration-300 relative ${
        isFullscreen 
          ? 'fixed inset-0 z-50 bg-gray-900 p-4 flex items-center justify-center max-w-none' 
          : 'max-w-2xl p-2'
      }`}
    >
      {/* Fullscreen Toggle Button - Always visible in top right */}
      <button
        onClick={toggleFullscreen}
        className={`absolute z-10 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl ${
          isFullscreen 
            ? 'top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-base border-2 border-red-400' 
            : 'top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold hover:scale-105 transform border-2 border-blue-400'
        }`}
        title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen Mode'}
      >
        {isFullscreen ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Exit</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="hidden sm:inline font-bold">Fullscreen</span>
          </>
        )}
      </button>

      <div className={`flex flex-col gap-2 w-full ${
        isFullscreen 
          ? 'max-w-6xl h-full pt-16' 
          : 'md:flex-row pt-16'
      }`}>
        {/* Calculator Title */}
        {isFullscreen && (
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-white">
              Scientific Calculator
            </h3>
          </div>
        )}

        <div className={`flex gap-4 ${isFullscreen ? 'h-full' : 'flex-col md:flex-row'}`}>
          {/* 历史记录栏 */}
          <div className={`bg-white border border-gray-200 rounded-lg shadow p-4 h-fit ${
            isFullscreen 
              ? 'w-1/3 max-h-full' 
              : 'md:w-1/3 w-full mb-2 md:mb-0'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`font-semibold text-gray-700 ${isFullscreen ? 'text-lg' : ''}`}>History</span>
              <button
                onClick={handleClearHistory}
                className={`text-red-500 hover:underline focus:outline-none ${
                  isFullscreen ? 'text-base' : 'text-xs'
                }`}
                disabled={history.length === 0}
              >
                Clear
              </button>
            </div>
            {history.length === 0 ? (
              <div className={`text-gray-400 italic ${isFullscreen ? 'text-base' : 'text-sm'}`}>
                No history yet.
              </div>
            ) : (
              <ul className={`overflow-y-auto divide-y divide-gray-100 ${
                isFullscreen ? 'max-h-full text-base' : 'max-h-56 text-sm'
              }`}>
                {history.map((item, i) => (
                  <li key={i} className="flex justify-between items-center py-2 font-mono">
                    <span className="text-gray-600 break-all mr-2">{item.expression}</span>
                    <span className="text-gray-900 font-bold whitespace-nowrap">= {item.result}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 计算器主体 */}
          <div className={`${isFullscreen ? 'w-2/3 flex flex-col' : 'md:w-2/3 w-full'}`}>
            {/* Display */}
            <div className={`bg-white border border-gray-200 rounded-lg shadow mb-4 ${
              isFullscreen ? 'p-6' : 'p-2'
            }`}>
              <div className="flex flex-col items-end px-2 py-1">
                <div className={`font-mono text-gray-500 overflow-x-auto w-full text-right ${
                  isFullscreen ? 'text-2xl h-10' : 'text-base h-6'
                }`}>
                  {expression || '0'}
                </div>
                <div className={`font-mono text-gray-900 overflow-x-auto w-full text-right font-bold ${
                  isFullscreen ? 'text-4xl h-12' : 'text-2xl h-8'
                }`}>
                  {result !== '' ? result : ''}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className={`grid grid-cols-10 gap-2 ${isFullscreen ? 'flex-1' : ''}`}>
              {buttons.flat().map((btn, idx) => (
                <button
                  key={idx}
                  className={`rounded border border-gray-200 bg-gray-50 hover:bg-gray-200 active:bg-gray-300 transition focus:outline-none font-semibold ${
                    isFullscreen 
                      ? 'py-4 px-2 text-lg md:text-xl hover:shadow-lg transform hover:scale-105' 
                      : 'py-1 px-1 text-xs sm:text-sm'
                  }`}
                  onClick={() => handleClick(btn)}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 