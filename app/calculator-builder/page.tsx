'use client';

import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Calculator {
  id: string;
  path: string;
  site: string;
  description: string;
}

interface BuildJob {
  id: string;
  calculator: Calculator;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  logs: string[];
  startTime?: Date;
  endTime?: Date;
}

interface BatchConfig {
  delay_between_builds: number;
  calculators: Calculator[];
}

export default function CalculatorBuilderPage() {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [singleCalc, setSingleCalc] = useState<Calculator>({
    id: '',
    path: '',
    site: '',
    description: ''
  });
  const [batchCalcs, setBatchCalcs] = useState<Calculator[]>([]);
  const [delayBetweenBuilds, setDelayBetweenBuilds] = useState(30);
  const [buildJobs, setBuildJobs] = useState<BuildJob[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // 添加新的批量计算器
  const addBatchCalculator = () => {
    const newCalc: Calculator = {
      id: Date.now().toString(),
      path: '',
      site: '',
      description: ''
    };
    setBatchCalcs([...batchCalcs, newCalc]);
  };

  // 更新批量计算器
  const updateBatchCalculator = (id: string, field: keyof Calculator, value: string) => {
    setBatchCalcs(prev => prev.map(calc => 
      calc.id === id ? { ...calc, [field]: value } : calc
    ));
  };

  // 删除批量计算器
  const removeBatchCalculator = (id: string) => {
    setBatchCalcs(prev => prev.filter(calc => calc.id !== id));
  };

  // 文件上传处理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config: BatchConfig = JSON.parse(e.target?.result as string);
        const calculatorsWithIds = config.calculators.map(calc => ({
          ...calc,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }));
        setBatchCalcs(calculatorsWithIds);
        setDelayBetweenBuilds(config.delay_between_builds || 30);
        toast.success('配置文件上传成功！');
      } catch (error) {
        toast.error('配置文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  // 导出配置文件
  const exportConfig = () => {
    const config: BatchConfig = {
      delay_between_builds: delayBetweenBuilds,
      calculators: batchCalcs.map(({ id, ...calc }) => calc)
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculators_config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 构建单个计算器
  const buildSingleCalculator = async () => {
    if (!singleCalc.path || !singleCalc.site) {
      toast.error('请填写路径和网站URL');
      return;
    }

    setIsBuilding(true);
    const jobId = Date.now().toString();
    const job: BuildJob = {
      id: jobId,
      calculator: singleCalc,
      status: 'running',
      progress: 0,
      logs: [],
      startTime: new Date()
    };
    
    setBuildJobs([job]);
    setCurrentJobId(jobId);

    try {
      const response = await fetch('/api/calculator-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          calculator: singleCalc
        })
      });

      if (!response.ok) throw new Error('构建失败');

      // 模拟进度更新
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setBuildJobs(prev => prev.map(j => 
          j.id === jobId ? { ...j, progress: i } : j
        ));
      }

      setBuildJobs(prev => prev.map(j => 
        j.id === jobId ? { 
          ...j, 
          status: 'completed', 
          endTime: new Date(),
          logs: [...j.logs, '构建完成！']
        } : j
      ));
      
      toast.success('计算器构建成功！');
    } catch (error) {
      setBuildJobs(prev => prev.map(j => 
        j.id === jobId ? { 
          ...j, 
          status: 'failed', 
          endTime: new Date(),
          logs: [...j.logs, `构建失败: ${error}`]
        } : j
      ));
      toast.error('构建失败');
    } finally {
      setIsBuilding(false);
      setCurrentJobId(null);
    }
  };

  // 批量构建计算器
  const buildBatchCalculators = async () => {
    if (batchCalcs.length === 0) {
      toast.error('请添加至少一个计算器');
      return;
    }

    const invalidCalcs = batchCalcs.filter(calc => !calc.path || !calc.site);
    if (invalidCalcs.length > 0) {
      toast.error('请完善所有计算器的路径和网站URL');
      return;
    }

    setIsBuilding(true);
    const jobs: BuildJob[] = batchCalcs.map(calc => ({
      id: calc.id,
      calculator: calc,
      status: 'pending',
      progress: 0,
      logs: []
    }));
    
    setBuildJobs(jobs);

    try {
      for (let i = 0; i < batchCalcs.length; i++) {
        const calc = batchCalcs[i];
        const jobId = calc.id;
        
        // 更新当前任务状态
        setBuildJobs(prev => prev.map(j => 
          j.id === jobId ? { ...j, status: 'running', startTime: new Date() } : j
        ));
        setCurrentJobId(jobId);

        const response = await fetch('/api/calculator-builder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'single',
            calculator: calc
          })
        });

        // 模拟进度更新
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setBuildJobs(prev => prev.map(j => 
            j.id === jobId ? { ...j, progress } : j
          ));
        }

        const status = response.ok ? 'completed' : 'failed';
        setBuildJobs(prev => prev.map(j => 
          j.id === jobId ? { 
            ...j, 
            status, 
            endTime: new Date(),
            logs: [...j.logs, status === 'completed' ? '构建完成' : '构建失败']
          } : j
        ));

        // 延迟到下一个任务
        if (i < batchCalcs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBuilds * 1000));
        }
      }

      const successCount = buildJobs.filter(j => j.status === 'completed').length;
      toast.success(`批量构建完成！成功: ${successCount}/${batchCalcs.length}`);
    } catch (error) {
      toast.error('批量构建过程中出现错误');
    } finally {
      setIsBuilding(false);
      setCurrentJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 头部 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculator Builder</h1>
          <p className="text-gray-600">自动化创建计算器工具 - 支持单个和批量操作</p>
        </div>

        {/* 模式选择 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setMode('single')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'single' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              单个计算器
            </button>
            <button
              onClick={() => setMode('batch')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'batch' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              批量操作
            </button>
          </div>
        </div>

        {/* 单个计算器模式 */}
        {mode === 'single' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">创建单个计算器</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  计算器路径 *
                </label>
                <input
                  type="text"
                  placeholder="/loan-calculator"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={singleCalc.path}
                  onChange={(e) => setSingleCalc(prev => ({ ...prev, path: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模仿网站URL *
                </label>
                <input
                  type="url"
                  placeholder="https://www.calculator.net/loan-calculator.html"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={singleCalc.site}
                  onChange={(e) => setSingleCalc(prev => ({ ...prev, site: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <input
                  type="text"
                  placeholder="贷款计算器"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={singleCalc.description}
                  onChange={(e) => setSingleCalc(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <button
              onClick={buildSingleCalculator}
              disabled={isBuilding}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBuilding ? '构建中...' : '开始构建'}
            </button>
          </div>
        )}

        {/* 批量操作模式 */}
        {mode === 'batch' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">批量操作</h2>
              <div className="flex space-x-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                >
                  导入配置
                </label>
                <button
                  onClick={exportConfig}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  导出配置
                </button>
                <button
                  onClick={addBatchCalculator}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  添加计算器
                </button>
              </div>
            </div>

            {/* 构建间隔设置 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                构建间隔（秒）
              </label>
              <input
                type="number"
                min="0"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={delayBetweenBuilds}
                onChange={(e) => setDelayBetweenBuilds(Number(e.target.value))}
              />
            </div>

            {/* 批量计算器列表 */}
            <div className="space-y-4 mb-4">
              {batchCalcs.map((calc, index) => (
                <div key={calc.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">计算器 #{index + 1}</h3>
                    <button
                      onClick={() => removeBatchCalculator(calc.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="路径"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={calc.path}
                      onChange={(e) => updateBatchCalculator(calc.id, 'path', e.target.value)}
                    />
                    <input
                      type="url"
                      placeholder="网站URL"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={calc.site}
                      onChange={(e) => updateBatchCalculator(calc.id, 'site', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="描述"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={calc.description}
                      onChange={(e) => updateBatchCalculator(calc.id, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {batchCalcs.length > 0 && (
              <button
                onClick={buildBatchCalculators}
                disabled={isBuilding}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isBuilding ? '批量构建中...' : `开始批量构建 (${batchCalcs.length}个)`}
              </button>
            )}
          </div>
        )}

        {/* 构建状态和日志 */}
        {buildJobs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">构建状态</h2>
            <div className="space-y-4">
              {buildJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{job.calculator.path}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                        job.status === 'running' ? 'bg-blue-100 text-blue-700' :
                        job.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {job.status === 'pending' ? '等待中' :
                         job.status === 'running' ? '运行中' :
                         job.status === 'completed' ? '已完成' : '失败'}
                      </span>
                      {job.id === currentJobId && (
                        <span className="animate-spin">⚙️</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {job.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  {job.logs.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {job.logs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
}