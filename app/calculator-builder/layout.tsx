import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Calculator Builder | Calcx - 自动化创建计算器工具',
  description: '使用Claude Code自动化创建计算器，支持单个和批量操作，内置实时进度监控和日志显示。',
  keywords: ['计算器构建器', 'Claude Code', '自动化工具', '批量创建', '计算器开发'],
  authors: [{ name: 'Calcx Team' }],
  openGraph: {
    title: 'Calculator Builder | Calcx',
    description: '自动化创建计算器工具，支持单个和批量操作',
    type: 'website',
    locale: 'zh_CN',
  },
  robots: {
    index: false, // 不希望这个管理页面被搜索引擎索引
    follow: false,
  },
};

export default function CalculatorBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 只在开发环境允许访问
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return children;
}