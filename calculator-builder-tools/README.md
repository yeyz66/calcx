# Calculator Builder Tools

这个目录包含了用于自动化创建计算器的所有工具和文档。

## 📁 目录结构

```
calculator-builder-tools/
├── README.md                    # 本文件 - 目录说明
├── README_calculator_builder.md # 详细使用说明和文档  
├── calculator_builder.py        # 主Python脚本
└── calculators_config.json      # 示例配置文件
```

## 🛠️ 工具说明

### 1. Python命令行工具
**文件**: `calculator_builder.py`

专业的命令行工具，支持：
- 单个计算器创建
- 批量计算器创建  
- 完整的错误处理和日志记录
- 与Claude Code深度集成

**快速开始**:
```bash
# 单个计算器
python calculator-builder-tools/calculator_builder.py --single --path "/loan-calculator" --site "https://example.com"

# 批量模式
python calculator-builder-tools/calculator_builder.py --batch calculator-builder-tools/calculators_config.json
```

### 2. Web界面工具  
**路径**: `/calculator-builder` (仅开发环境)

直观的Web界面，提供：
- 可视化操作界面
- 实时进度监控
- 文件导入/导出功能
- 表格式批量编辑

**访问方式**:
```bash
npm run dev
# 然后访问 http://localhost:3000/calculator-builder
```

## 🎯 选择合适的工具

### 使用Python脚本 当你:
- 喜欢命令行操作
- 需要集成到CI/CD流程
- 要在服务器环境运行
- 需要自定义脚本逻辑

### 使用Web界面 当你:
- 喜欢可视化操作
- 需要实时监控进度
- 要快速编辑配置
- 偶尔使用的场景

## 📖 详细文档

完整的使用说明、配置选项、错误处理等信息请查看：
**[📋 Calculator Builder 使用说明](./README_calculator_builder.md)**

## 🔧 配置文件

`calculators_config.json` 是批量操作的示例配置文件，包含：
- 构建间隔设置
- 计算器列表配置
- 标准JSON格式

可以直接编辑此文件或通过Web界面导入/导出。

## 🚀 快速上手

1. **准备环境**: 确保安装了Python 3.7+和Claude Code CLI
2. **选择工具**: Python脚本或Web界面
3. **配置参数**: 设置计算器路径和模仿网站
4. **执行构建**: 运行脚本或点击界面按钮
5. **监控进度**: 查看日志或界面进度

## 💡 提示

- 建议先在测试分支运行
- 大量计算器分批执行
- 保持网络连接稳定
- 及时查看日志排查问题

## 🔗 相关链接

- [项目主页](../)
- [Claude Code文档](https://docs.anthropic.com/en/docs/claude-code)
- [Next.js文档](https://nextjs.org/docs)