import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { intentSeoPages } from '@/lib/seo-pages';

export const metadata: Metadata = {
  title: 'Ressources pricing, marge et devis pour indépendants | Tarifly',
  description:
    'Guides Tarifly pour calculer un prix rentable, comprendre sa marge, créer un devis professionnel et suivre ses opportunités commerciales.',
  alternates: {
    canonical: '/ressources',
  },
};

export default function ResourcesIndexPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f6f9fc] text-slate-950">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 md:py-18">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-600">Ressources Tarifly</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-brand-900 md:text-6xl">
              Guides pour mieux calculer vos prix, vos marges et vos devis.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Des pages utiles pour comprendre comment chiffrer une mission, défendre un prix, comparer son tarif au marché et transformer le calcul en devis professionnel.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-2">
            {intentSeoPages.map((page) => (
              <Link key={page.slug} href={`/ressources/${page.slug}`} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-100 hover:shadow-soft">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">Guide</p>
                <h2 className="mt-3 text-2xl font-black text-brand-900">{page.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{page.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-brand-600">
                  Lire le guide
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
