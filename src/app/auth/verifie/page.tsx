import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function VerifiedAccountPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft md:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <CheckCircle2 size={28} />
          </div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Compte vérifié</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Votre compte a bien été vérifié.</h1>
          <p className="mx-auto mt-5 max-w-xl leading-8 text-slate-600">
            Vous pouvez maintenant vous connecter et accéder à votre espace Tarifly.
          </p>
          <Link
            href="/connexion"
            className="mt-8 inline-flex rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Se connecter
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
