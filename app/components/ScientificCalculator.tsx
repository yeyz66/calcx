'use client';
import React, { useState, useEffect } from 'react';
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
    <section className="w-full max-w-2xl mx-auto p-2">
      <div className="flex flex-col md:flex-row gap-2">
        {/* 历史记录栏 */}
        <div className="md:w-1/3 w-full bg-white border border-gray-200 rounded-lg shadow p-2 mb-2 md:mb-0 md:mr-2 h-fit">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-700">History</span>
            <button
              onClick={handleClearHistory}
              className="text-xs text-red-500 hover:underline focus:outline-none"
              disabled={history.length === 0}
            >
              Clear
            </button>
          </div>
          {history.length === 0 ? (
            <div className="text-gray-400 italic text-sm">No history yet.</div>
          ) : (
            <ul className="max-h-56 overflow-y-auto divide-y divide-gray-100">
              {history.map((item, i) => (
                <li key={i} className="flex justify-between items-center py-1 text-sm font-mono">
                  <span className="text-gray-600">{item.expression}</span>
                  <span className="text-gray-900 font-bold">= {item.result}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* 计算器主体 */}
        <div className="md:w-2/3 w-full">
          <div className="bg-white border border-gray-200 rounded-lg shadow p-2 mb-2">
            <div className="flex flex-col items-end px-2 py-1">
              <div className="text-base font-mono text-gray-500 h-6 overflow-x-auto w-full text-right">
                {expression || '0'}
              </div>
              <div className="text-2xl font-mono text-gray-900 h-8 overflow-x-auto w-full text-right">
                {result !== '' ? result : ''}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {buttons.flat().map((btn, idx) => (
              <button
                key={idx}
                className="py-1 px-1 text-xs sm:text-sm rounded border border-gray-200 bg-gray-50 hover:bg-gray-200 active:bg-gray-300 transition focus:outline-none"
                onClick={() => handleClick(btn)}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 