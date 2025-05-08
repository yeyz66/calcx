import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CD Calculator | Calculate Certificate of Deposit Interest and Returns',
  description: 'Calculate the accumulated interest and final balance of your Certificate of Deposit (CD) with our easy-to-use calculator. Includes tax impact and visualization tools.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
} 