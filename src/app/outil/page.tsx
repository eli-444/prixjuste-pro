import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ToolForm } from '@/components/ToolForm';

export default function ToolPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <ToolForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
