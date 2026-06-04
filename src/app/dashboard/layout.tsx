import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { DashboardSidebar } from '@/components/DashboardSidebar';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex h-[calc(100vh-73px)] flex-col overflow-hidden bg-[#f4f8fb] text-slate-950 lg:flex-row">
        <DashboardSidebar />
        <section className="min-w-0 flex-1 overflow-hidden">{children}</section>
      </main>
    </>
  );
}
