# Calculator Builder 使用说明

这是一个自动化创建计算器的Python脚本，支持单个和批量执行模式。

## 功能特性

- ✅ 单个计算器自动化创建
- ✅ 批量计算器创建
- ✅ 与 Claude Code 集成
- ✅ 完整的错误处理和日志记录
- ✅ 可配置的执行间隔
- ✅ 详细的执行报告

## 安装要求

确保你已经安装并配置了：

1. **Python 3.7+**
2. **Claude Code CLI** - 确保 `claude` 命令可用
3. **项目依赖** - 在计算器项目目录中运行

## 使用方法

### 1. 单个计算器模式

创建单个计算器：

```bash
python calculator-builder-tools/calculator_builder.py --single --path "/loan-calculator" --site "https://www.calculator.net/loan-calculator.html"
```

### 2. 批量计算器模式

#### 步骤1: 生成配置文件模板

```bash
python calculator-builder-tools/calculator_builder.py --generate-config my_calculators.json
```

#### 步骤2: 编辑配置文件

编辑生成的 `my_calculators.json`，添加你要创建的计算器：

```json
{
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
    }
  ]
}
```

#### 步骤3: 执行批量创建

```bash
python calculator-builder-tools/calculator_builder.py --batch my_calculators.json
```

## 配置文件说明

### 配置参数

- **`delay_between_builds`**: 每个计算器创建之间的延迟时间（秒）
- **`calculators`**: 计算器列表

### 计算器配置

每个计算器需要包含：

- **`path`**: 计算器的路径（如 `/payment-calculator`）
- **`site`**: 要模仿的网站URL
- **`description`**: 计算器描述（可选，用于记录）

## 执行流程

脚本会自动执行以下步骤：

1. **创作类似功能** - 基于提供的网站创建计算器
2. **Playwright测试** - 自动测试按钮和输入输出功能
3. **更新sitemap** - 将新计算器添加到sitemap.xml
4. **更新首页入口** - 在CalculatorGroups.tsx中添加入口
5. **构建测试** - 运行 `npm run build` 修复报错
6. **Git提交推送** - 提交并推送到master分支

## 日志和监控

### 日志文件

脚本会在当前目录生成 `calculator_builder.log` 文件，包含详细的执行日志。

### 实时监控

执行过程中会在控制台显示实时进度：

```
2025-07-12 20:25:33 - INFO - 开始构建计算器: /loan-calculator
2025-07-12 20:25:33 - INFO - 模仿网站: https://www.calculator.net/loan-calculator.html
2025-07-12 20:25:34 - INFO - 开始执行 Claude Code...
2025-07-12 20:26:45 - INFO - Claude Code 执行成功
2025-07-12 20:26:45 - INFO - 计算器 /loan-calculator 构建完成
```

## 错误处理

### 常见错误

1. **Claude Code未安装**
   ```
   错误: claude: command not found
   解决: 安装并配置Claude Code CLI
   ```

2. **配置文件格式错误**
   ```
   错误: 配置文件格式错误: Expecting ',' delimiter
   解决: 检查JSON语法
   ```

3. **执行超时**
   ```
   错误: Claude Code 执行超时
   解决: 增加网络稳定性或简化任务
   ```

### 失败重试

批量模式下，单个计算器失败不会影响其他计算器的创建。脚本会在最后提供详细的成功/失败报告。

## 高级用法

### 自定义工作目录

```bash
python calculator-builder-tools/calculator_builder.py --single --path "/my-calc" --site "https://example.com" --work-dir "/path/to/project"
```

### 自定义延迟

在配置文件中调整 `delay_between_builds` 参数：

```json
{
  "delay_between_builds": 60,  // 增加到60秒
  "calculators": [...]
}
```

## 最佳实践

1. **测试环境** - 建议先在测试分支运行
2. **备份代码** - 执行前确保代码已备份
3. **网络稳定** - 确保网络连接稳定
4. **分批执行** - 大量计算器建议分批执行
5. **监控日志** - 及时查看日志文件排查问题

## 故障排除

### 检查Claude Code

```bash
claude --version
```

### 检查项目状态

```bash
git status
npm run build
```

### 查看详细日志

```bash
tail -f calculator_builder.log
```

## 示例场景

### 创建金融计算器套件

```json
{
  "delay_between_builds": 45,
  "calculators": [
    {
      "path": "/compound-interest-calculator",
      "site": "https://www.calculator.net/compound-interest-calculator.html",
      "description": "复利计算器"
    },
    {
      "path": "/retirement-calculator",
      "site": "https://www.calculator.net/retirement-calculator.html", 
      "description": "退休计算器"
    },
    {
      "path": "/auto-loan-calculator",
      "site": "https://www.calculator.net/auto-loan-calculator.html",
      "description": "汽车贷款计算器"
    }
  ]
}
```

### 创建健康计算器套件

```json
{
  "delay_between_builds": 30,
  "calculators": [
    {
      "path": "/bmi-calculator",
      "site": "https://www.calculator.net/bmi-calculator.html",
      "description": "BMI计算器"
    },
    {
      "path": "/calorie-calculator", 
      "site": "https://www.calculator.net/calorie-calculator.html",
      "description": "卡路里计算器"
    }
  ]
}
```