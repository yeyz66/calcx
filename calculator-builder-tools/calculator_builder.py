#!/usr/bin/env python3
"""
Calculator Builder - 自动化创建计算器的脚本
支持单个和批量执行模式
"""

import argparse
import json
import logging
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('calculator_builder.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class CalculatorBuilder:
    """Calculator Builder 主类"""
    
    def __init__(self, work_dir: str = "."):
        self.work_dir = Path(work_dir)
        self.prompt_template = """页面路径：{path}
模仿网站：{site}
1. 创作一个类似的功能
2. 实现好后使用playwright访问自己测试下，按钮、输入输出功能是否正确。
3. 更新sitemap
4. 首页记得加入口
5. 测试完之后运行npm run build修复报错
6. 提交并推送到master分支"""

    def execute_claude_code(self, prompt: str) -> bool:
        """执行 Claude Code 命令"""
        try:
            logger.info("开始执行 Claude Code...")
            logger.info(f"提示词: {prompt[:100]}...")
            
            # 使用 claude 命令执行提示词
            result = subprocess.run([
                'claude', prompt
            ], 
            cwd=self.work_dir,
            capture_output=True, 
            text=True, 
            timeout=3600  # 1小时超时
            )
            
            if result.returncode == 0:
                logger.info("Claude Code 执行成功")
                logger.debug(f"输出: {result.stdout}")
                return True
            else:
                logger.error(f"Claude Code 执行失败: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("Claude Code 执行超时")
            return False
        except Exception as e:
            logger.error(f"执行 Claude Code 时发生错误: {e}")
            return False

    def build_single_calculator(self, path: str, site: str) -> bool:
        """构建单个计算器"""
        logger.info(f"开始构建计算器: {path}")
        logger.info(f"模仿网站: {site}")
        
        # 替换模板中的变量
        prompt = self.prompt_template.format(path=path, site=site)
        
        # 执行 Claude Code
        success = self.execute_claude_code(prompt)
        
        if success:
            logger.info(f"计算器 {path} 构建完成")
        else:
            logger.error(f"计算器 {path} 构建失败")
            
        return success

    def build_batch_calculators(self, config_file: str) -> Dict[str, bool]:
        """批量构建计算器"""
        logger.info(f"开始批量构建，配置文件: {config_file}")
        
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
        except FileNotFoundError:
            logger.error(f"配置文件 {config_file} 不存在")
            return {}
        except json.JSONDecodeError as e:
            logger.error(f"配置文件 {config_file} 格式错误: {e}")
            return {}

        calculators = config.get('calculators', [])
        results = {}
        
        for i, calc in enumerate(calculators, 1):
            path = calc.get('path')
            site = calc.get('site')
            
            if not path or not site:
                logger.warning(f"第 {i} 个计算器配置不完整，跳过")
                continue
                
            logger.info(f"处理第 {i}/{len(calculators)} 个计算器")
            
            success = self.build_single_calculator(path, site)
            results[path] = success
            
            # 添加延迟避免过于频繁的请求
            if i < len(calculators):
                delay = config.get('delay_between_builds', 30)
                logger.info(f"等待 {delay} 秒后处理下一个...")
                time.sleep(delay)
        
        return results

    def generate_sample_config(self, output_file: str):
        """生成示例配置文件"""
        sample_config = {
            "delay_between_builds": 30,
            "calculators": [
                {
                    "path": "/mortgage-calculator",
                    "site": "https://www.calculator.net/mortgage-calculator.html",
                    "description": "房贷计算器"
                },
                {
                    "path": "/savings-calculator", 
                    "site": "https://www.calculator.net/savings-calculator.html",
                    "description": "储蓄计算器"
                },
                {
                    "path": "/investment-calculator",
                    "site": "https://www.calculator.net/investment-calculator.html", 
                    "description": "投资计算器"
                }
            ]
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(sample_config, f, indent=2, ensure_ascii=False)
        
        logger.info(f"示例配置文件已生成: {output_file}")

def main():
    parser = argparse.ArgumentParser(description='Calculator Builder - 自动化创建计算器')
    
    # 创建互斥组，确保只能选择一种模式
    group = parser.add_mutually_exclusive_group(required=True)
    
    group.add_argument('--single', action='store_true',
                      help='单个计算器模式')
    group.add_argument('--batch', type=str,
                      help='批量模式，指定配置文件路径')
    group.add_argument('--generate-config', type=str,
                      help='生成示例配置文件')
    
    # 单个模式的参数
    parser.add_argument('--path', type=str,
                       help='计算器路径 (如: /payment-calculator)')
    parser.add_argument('--site', type=str,
                       help='模仿的网站URL')
    
    # 工作目录
    parser.add_argument('--work-dir', type=str, default='.',
                       help='工作目录 (默认: 当前目录)')
    
    args = parser.parse_args()
    
    builder = CalculatorBuilder(args.work_dir)
    
    # 生成配置文件模式
    if args.generate_config:
        builder.generate_sample_config(args.generate_config)
        return
    
    # 单个计算器模式
    if args.single:
        if not args.path or not args.site:
            parser.error("单个模式需要 --path 和 --site 参数")
        
        success = builder.build_single_calculator(args.path, args.site)
        sys.exit(0 if success else 1)
    
    # 批量模式
    if args.batch:
        results = builder.build_batch_calculators(args.batch)
        
        # 输出结果统计
        total = len(results)
        success_count = sum(1 for success in results.values() if success)
        fail_count = total - success_count
        
        logger.info("=" * 50)
        logger.info("批量构建完成")
        logger.info(f"总计: {total}, 成功: {success_count}, 失败: {fail_count}")
        
        if fail_count > 0:
            logger.info("失败的计算器:")
            for path, success in results.items():
                if not success:
                    logger.info(f"  - {path}")
        
        sys.exit(0 if fail_count == 0 else 1)

if __name__ == '__main__':
    main()