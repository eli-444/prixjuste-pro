import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { professionSeoPages } from '@/lib/seo-pages';

export const metadata: Metadata = {
  title: 'Guides métiers : prix, marge et devis professionnels | Tarifly',
  description:
    'Guides métiers Tarifly pour calculer un tarif, comparer un prix au marché et générer un devis professionnel selon son activité.',
  alternates: {
    canonical: '/metiers',
  },
};

export default function ProfessionsIndexPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f6f9fc] text-slate-950">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 md:py-18">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-600">Guides métiers</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-brand-900 md:text-6xl">
              Calculer un prix et préparer un devis selon votre métier.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Chaque métier a ses coûts, ses unités de facturation et ses habitudes de marché. Ces guides aident à structurer un prix avant de l’envoyer au client.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:grid-cols-2 lg:grid-cols-3">
            {professionSeoPages.map((page) => (
              <Link key={page.slug} href={`/metiers/${page.slug}`} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-100 hover:shadow-soft">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">Métier</p>
                <h2 className="mt-3 text-xl font-black text-brand-900">{page.profession}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{page.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-brand-600">
                  Voir le guide
                  <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
