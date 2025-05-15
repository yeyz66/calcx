import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IVF Due Date Calculator | Calculate Your IVF Pregnancy Timeline',
  description: 'Estimate your IVF due date based on your embryo transfer details. Our calculator helps you understand your pregnancy timeline with 3-day or 5-day transfers.',
  // keywords: ['ivf due date calculator', 'ivf pregnancy calculator', 'embryo transfer due date', '3-day transfer due date', '5-day transfer due date'],
};

export default function IvfDueDateCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
} 