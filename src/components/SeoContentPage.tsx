import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, CheckCircle2, CircleAlert, FileText, SearchCheck } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { baseUrl, intentSeoPages, professionSeoPages, type SeoPage } from '@/lib/seo-pages';

type Props = {
  page: SeoPage;
  type: 'resource' | 'profession';
};

export function SeoContentPage({ page, type }: Props) {
  const pageUrl = `${baseUrl}/${type === 'resource' ? 'ressources' : 'metiers'}/${page.slug}`;
  const jsonLd = buildJsonLd(page, pageUrl);
  const relatedLinks = getRelatedLinks(page);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <Header />
      <main className="bg-[#f6f9fc] text-slate-950">
        <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#eefcff_60%,#f6f9fc_100%)]">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:py-16 lg:grid-cols-[1fr_0.72fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-600">
                {type === 'profession' ? 'Guide métier Tarifly' : 'Guide pricing Tarifly'}
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-brand-900 md:text-6xl">
                {page.h1}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">{page.intro}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard/facturation" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-4 text-sm font-black text-white shadow-glow transition hover:bg-brand-900">
                  Utiliser Tarifly
                  <ArrowRight size={16} />
                </Link>
                <Link href="/ressources" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-black text-brand-900 shadow-sm transition hover:border-brand-100 hover:text-brand-600">
                  Voir les ressources
                </Link>
              </div>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                  <SearchCheck size={22} />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Objectif</p>
                  <p className="font-black text-brand-900">Prix, marge, devis et suivi</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-950">Pour qui ?</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{page.audience}</p>
              </div>
              <div className="mt-4 grid gap-2">
                {page.benefits.slice(0, 3).map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2 rounded-2xl border border-slate-100 bg-white p-3 text-sm font-bold text-slate-700">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={16} />
                    {benefit}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="bg-white py-14 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-2">
            <ArticlePanel icon={<CircleAlert size={19} />} title="Les erreurs fréquentes">
              <ul className="grid gap-3">
                {page.painPoints.map((item) => (
                  <li key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                    {item}
                  </li>
                ))}
              </ul>
            </ArticlePanel>

            <ArticlePanel icon={<CheckCircle2 size={19} />} title="Ce que Tarifly structure">
              <ul className="grid gap-3">
                {page.benefits.map((item) => (
                  <li key={item} className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 text-sm font-semibold leading-6 text-brand-950">
                    {item}
                  </li>
                ))}
              </ul>
            </ArticlePanel>
          </div>
        </section>

        <section className="py-14 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-600">Exemple</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-brand-900">{page.example.title}</h2>
              <p className="mt-4 text-base leading-8 text-slate-700">{page.example.conclusion}</p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
              {page.example.rows.map((row) => (
                <div key={row.label} className="grid grid-cols-[0.75fr_1fr] gap-4 border-b border-slate-100 p-4 last:border-b-0">
                  <p className="text-sm font-black text-slate-500">{row.label}</p>
                  <p className="text-sm font-black text-slate-950">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-16">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-600">Questions fréquentes</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {page.faq.map((item) => (
                <article key={item.question} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-black text-brand-900">{item.question}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div className="rounded-3xl bg-brand-900 p-7 text-white shadow-soft">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-aqua-200">Passer à l’action</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Transformez ce calcul en devis suivi.</h2>
              <p className="mt-4 max-w-2xl leading-8 text-slate-200">
                Tarifly relie le chiffrage, la marge, le benchmark marché, le devis PDF, la signature client et le suivi commercial.
              </p>
              <Link href="/dashboard/facturation" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-brand-900 transition hover:bg-aqua-100">
                Démarrer avec Tarifly
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-aqua-50 text-aqua-600">
                  <FileText size={18} />
                </span>
                <p className="font-black text-brand-900">À lire aussi</p>
              </div>
              <div className="mt-4 grid gap-2">
                {relatedLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-bold text-slate-700 transition hover:border-brand-100 hover:bg-brand-50 hover:text-brand-900">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ArticlePanel({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft md:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</span>
        <h2 className="text-2xl font-black tracking-tight text-brand-900">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function getRelatedLinks(page: SeoPage) {
  const resources = intentSeoPages.map((item) => ({ ...item, href: `/ressources/${item.slug}` }));
  const professions = professionSeoPages.map((item) => ({ ...item, href: `/metiers/${item.slug}` }));
  const candidates = [...resources, ...professions];
  const explicit = page.relatedSlugs
    ?.map((slug) => candidates.find((item) => item.slug === slug))
    .filter(Boolean) as Array<{ title: string; href: string }> | undefined;

  if (explicit && explicit.length > 0) {
    return explicit.map((item) => ({ label: item.title, href: item.href }));
  }

  return candidates
    .filter((item) => item.slug !== page.slug)
    .slice(0, 4)
    .map((item) => ({ label: item.title, href: item.href }));
}

function buildJsonLd(page: SeoPage, pageUrl: string) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.metaTitle,
      description: page.description,
      url: pageUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Tarifly',
        url: baseUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Tarifly',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: page.title,
          item: pageUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ];
}
