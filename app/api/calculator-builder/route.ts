import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

interface Calculator {
  path: string;
  site: string;
  description?: string;
}

interface BuildRequest {
  mode: 'single' | 'batch';
  calculator?: Calculator;
  calculators?: Calculator[];
  delayBetweenBuilds?: number;
}

export async function POST(request: NextRequest) {
  // 只在开发环境允许访问
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: '此功能仅在开发环境可用' },
      { status: 403 }
    );
  }

  try {
    const body: BuildRequest = await request.json();
    
    if (body.mode === 'single' && body.calculator) {
      const result = await buildSingleCalculator(body.calculator);
      return NextResponse.json(result);
    } else if (body.mode === 'batch' && body.calculators) {
      const result = await buildBatchCalculators(body.calculators, body.delayBetweenBuilds || 30);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: '无效的请求参数' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
}

async function buildSingleCalculator(calculator: Calculator) {
  return new Promise((resolve, reject) => {
    const projectRoot = process.cwd();
    
    // 创建提示词
    const prompt = `页面路径：${calculator.path}
模仿网站：${calculator.site}
1. 创作一个类似的功能
2. 实现好后使用playwright访问自己测试下，按钮、输入输出功能是否正确。
3. 更新sitemap
4. 首页记得加入口
5. 测试完之后运行npm run build修复报错
6. 提交并推送到master分支`;

    console.log('开始执行 Claude Code...');
    console.log('计算器路径:', calculator.path);
    console.log('模仿网站:', calculator.site);

    // 执行 claude 命令
    const child = spawn('claude', [prompt], {
      cwd: projectRoot,
      stdio: 'pipe',
      shell: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
      console.log('Claude 输出:', data.toString());
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
      console.error('Claude 错误:', data.toString());
    });

    child.on('close', (code) => {
      console.log('Claude Code 执行完成，退出码:', code);
      
      if (code === 0) {
        resolve({
          success: true,
          calculator: calculator.path,
          output: stdout,
          message: '计算器构建成功'
        });
      } else {
        reject({
          success: false,
          calculator: calculator.path,
          error: stderr || stdout,
          message: '计算器构建失败'
        });
      }
    });

    child.on('error', (error) => {
      console.error('执行 Claude Code 时发生错误:', error);
      reject({
        success: false,
        calculator: calculator.path,
        error: error.message,
        message: '无法执行 Claude Code'
      });
    });

    // 设置超时（1小时）
    setTimeout(() => {
      child.kill();
      reject({
        success: false,
        calculator: calculator.path,
        error: '执行超时',
        message: '计算器构建超时'
      });
    }, 3600000);
  });
}

async function buildBatchCalculators(calculators: Calculator[], delayBetweenBuilds: number) {
  const results = [];
  
  for (let i = 0; i < calculators.length; i++) {
    const calculator = calculators[i];
    console.log(`处理第 ${i + 1}/${calculators.length} 个计算器: ${calculator.path}`);
    
    try {
      const result = await buildSingleCalculator(calculator);
      results.push(result);
      console.log(`计算器 ${calculator.path} 构建成功`);
    } catch (error) {
      results.push(error);
      console.error(`计算器 ${calculator.path} 构建失败:`, error);
    }
    
    // 添加延迟（除了最后一个）
    if (i < calculators.length - 1) {
      console.log(`等待 ${delayBetweenBuilds} 秒后处理下一个...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenBuilds * 1000));
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  return {
    success: failCount === 0,
    total: results.length,
    successCount,
    failCount,
    results,
    message: `批量构建完成: 成功 ${successCount}/${results.length}`
  };
}

// 获取构建状态的 GET 端点
export async function GET(request: NextRequest) {
  // 只在开发环境允许访问
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: '此功能仅在开发环境可用' },
      { status: 403 }
    );
  }

  try {
    // 这里可以返回当前的构建状态，日志文件等
    const logPath = path.join(process.cwd(), 'calculator_builder.log');
    
    try {
      const logContent = await fs.readFile(logPath, 'utf-8');
      const logs = logContent.split('\n').filter(line => line.trim()).slice(-50); // 最近50行
      
      return NextResponse.json({
        success: true,
        logs
      });
    } catch (error) {
      return NextResponse.json({
        success: true,
        logs: ['暂无日志文件']
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: '获取日志失败' },
      { status: 500 }
    );
  }
}