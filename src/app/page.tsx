import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, BarChart3, CheckCircle2, FileText, ShieldCheck, Sparkles, Timer } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PricingCard } from '@/components/PricingCard';
import { AuthCodeRedirect } from '@/components/AuthCodeRedirect';

export const metadata: Metadata = {
  title: 'Logiciel de calcul de prix, marge et devis pour indépendants',
  description:
    'Tarifly est un logiciel SaaS pour calculer un prix rentable, analyser sa marge, comparer son tarif au marché, suivre ses opportunités commerciales et générer des devis professionnels.',
  alternates: {
    canonical: '/',
  },
};

const faqItems = [
  {
    question: "A qui s'adresse Tarifly ?",
    answer:
      'Aux professionnels qui doivent chiffrer une prestation, un produit ou une offre sur mesure : indépendants, artisans, consultants, formateurs, créateurs et petites entreprises.',
  },
  {
    question: "L'outil remplace-t-il un expert-comptable ?",
    answer:
      'Non. Tarifly aide à structurer un prix de vente et à vérifier une rentabilité. Pour les décisions comptables, fiscales ou juridiques, un conseiller spécialisé reste la référence.',
  },
  {
    question: 'Quelles informations dois-je préparer ?',
    answer:
      'Quelques données suffisent : temps estimé, coûts directs, frais, marge souhaitée et taxes éventuelles.',
  },
  {
    question: 'Puis-je utiliser le résultat dans mes devis ?',
    answer:
      'Oui. Tarifly permet de générer des devis professionnels et des documents PDF à partir des informations renseignées.',
  },
  {
    question: 'Est-ce adapté si mes prestations changent souvent ?',
    answer:
      'Oui. Chaque mission peut être chiffrée séparément avec ses propres hypothèses, coûts, délais et données de marché.',
  },
  {
    question: 'Y a-t-il un abonnement ?',
    answer:
      'Oui. Tarifly Premium est un abonnement mensuel sans engagement, résiliable depuis l’espace compte.',
  },
];

const homeJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tarifly',
    url: 'https://tarifly.vercel.app',
    logo: 'https://tarifly.vercel.app/logo.png',
    sameAs: ['https://tarifly.vercel.app'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tarifly',
    url: 'https://tarifly.vercel.app',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Tarifly',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://tarifly.vercel.app',
    image: 'https://tarifly.vercel.app/home-target.png',
    description:
      'Logiciel SaaS de calcul de prix, analyse de marge, comparaison marché, gestion d’opportunités commerciales et génération de devis professionnels.',
    offers: {
      '@type': 'Offer',
      price: '9.90',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      category: 'Abonnement mensuel',
    },
    featureList: [
      'Calcul de prix rentable',
      'Analyse de marge',
      'Comparaison avec des données de marché',
      'Gestion des opportunités commerciales',
      'Génération de devis PDF',
      'Export CSV',
    ],
    audience: {
      '@type': 'Audience',
      audienceType: 'Indépendants, freelances, artisans, consultants, prestataires et TPE',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ code?: string }>;
}) {
  const params = await searchParams;

  if (params?.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}&next=${encodeURIComponent('/connexion')}`);
  }

  return (
    <>
      <AuthCodeRedirect />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <Header />
      <main>
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_12%_10%,rgba(17,207,194,0.22),transparent_32%),radial-gradient(circle_at_88%_4%,rgba(8,120,242,0.18),transparent_30%),linear-gradient(180deg,#ffffff_0%,#eefcff_58%,#f7fbff_100%)]">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                Le logiciel pour fixer le <span className="text-brand-600">bon tarif</span> avant d'envoyer votre devis.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Tarifly transforme vos coûts, votre temps et vos frais en un prix clair, défendable et rentable.
                Ce calculateur de prix aide les indépendants, artisans et prestataires à protéger leur marge,
                comparer leur tarif au marché et préparer des devis professionnels.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/outil" className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#061747_0%,#0878f2_55%,#11cfc2_100%)] px-6 py-4 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
                  Calculer mon prix
                  <ArrowRight size={16} />
                </Link>
                <Link href="#tarifs" className="inline-flex items-center justify-center rounded-full border border-aqua-100 bg-white px-6 py-4 text-sm font-semibold text-brand-900 shadow-sm transition hover:border-aqua-500 hover:text-brand-600">
                  Voir l'offre
                </Link>
              </div>
            </div>

            <div className="relative self-center overflow-hidden rounded-3xl border border-aqua-100 bg-white shadow-glow">
              <Image
                src="/home-target.png"
                alt="Objectif commercial atteint avec un devis mieux positionne"
                width={1680}
                height={945}
                priority
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </section>

        <section id="fonctionnement" className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4">
              <SectionTitle
                eyebrow="Methode"
                title="Un calcul de marge simple pour une décision de prix plus solide."
                description="Tarifly remet de la méthode dans une décision souvent prise trop vite : combien facturer sans rogner sa marge, perdre en crédibilité commerciale ou sous-estimer ses frais."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <Feature accent="aqua" icon={<Timer />} title="1. Renseignez vos données" text="Temps prévu, coûts directs, frais, taux horaire, marge souhaitée et taxes éventuelles." />
              <Feature accent="blue" icon={<BarChart3 />} title="2. Analysez votre rentabilité" text="L'outil calcule un prix recommandé et met en évidence la marge réelle de votre prestation." />
              <Feature accent="orange" icon={<FileText />} title="3. Presentez un tarif clair" text="Vous repartez avec une formulation professionnelle pour expliquer votre prix sans vous justifier maladroitement." />
            </div>
          </div>
        </section>

        <section id="cibles" className="bg-[linear-gradient(180deg,#f8fafc_0%,#eafffb_100%)] py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="self-center overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-soft">
              <img
                src="/home-profiles-v2.png"
                alt="Professionnel qui suit ses devis et ses opportunites commerciales"
                className="block h-auto w-full"
              />
            </div>
            <div>
              <SectionTitle
                eyebrow="Profils"
                title="Un logiciel de devis pensé pour ceux qui vendent leur temps, leur savoir-faire ou une prestation sur mesure."
                description="Que vous soyez indépendant, artisan, consultant ou dirigeant de TPE, l'enjeu reste le même : vendre au bon prix, avec une marge maîtrisée et un devis clair."
              />
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {['Freelances', 'Artisans', 'Consultants', 'Createurs', 'Formateurs', 'Coachings', 'Prestataires', 'TPE'].map((target, index) => (
                  <div
                    key={target}
                    className={`rounded-2xl border p-5 font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${
                      index % 3 === 0
                        ? 'border-aqua-100 bg-aqua-50 text-teal-950'
                        : index % 3 === 1
                          ? 'border-orange-100 bg-[#fff7ed] text-slate-900'
                          : 'border-brand-100 bg-brand-50 text-brand-900'
                    }`}
                  >
                    {target}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_0.92fr] lg:items-center">
            <div>
              <SectionTitle
                eyebrow="Valeur"
                title="Arrêtez de fixer vos prix au feeling."
                description="Un prix trop bas fatigue votre activité. Un prix mal expliqué fragilise la vente. Tarifly vous aide à poser un tarif argumenté, lisible et cohérent avec vos objectifs."
              />
              <div className="mt-10 grid gap-5 md:grid-cols-3 lg:grid-cols-1">
                <Feature accent="blue" icon={<ShieldCheck />} title="Protéger votre marge" text="Chaque prix tient compte de vos coûts réels, de votre temps et du niveau de rentabilité attendu." />
                <Feature accent="aqua" icon={<Sparkles />} title="Gagner en crédibilité" text="Vous présentez un tarif structuré, moins improvisé, plus facile à assumer face au client." />
                <Feature accent="orange" icon={<CheckCircle2 />} title="Décider plus vite" text="Vous remplacez les hésitations et les calculs dispersés par une recommandation exploitable immédiatement." />
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fbff] shadow-soft">
              <Image
                src="/home-value.png"
                alt="Professionnel qui reflechit au bon prix a proposer"
                width={1680}
                height={945}
                className="h-full min-h-[340px] w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section id="tarifs" className="bg-[linear-gradient(180deg,#eefcff_0%,#f8fafc_100%)] py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionTitle
                eyebrow="Acces"
                title="Un abonnement mensuel pour chiffrer vos prestations avec plus de methode."
                description="Testez le calcul gratuitement, puis débloquez le diagnostic complet lorsque vous voulez exploiter le résultat dans vos devis et échanges clients. L'abonnement est mensuel, sans engagement et résiliable depuis votre compte."
              />
              <div className="mt-8 space-y-4">
                {[
                  'Calcul gratuit pour obtenir une premiere estimation.',
                  'Diagnostic complet pour comprendre votre marge et votre niveau de risque.',
                  'Texte de justification professionnel pour accompagner votre proposition.',
                  'Export PDF professionnel et abonnement mensuel résiliable en ligne.',
                ].map((item) => (
                  <p key={item} className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-3 font-medium text-slate-700 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-aqua-600" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <PricingCard />
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              eyebrow="FAQ"
              title="Questions frequentes"
              description="Les réponses essentielles avant d'utiliser Tarifly pour préparer vos prix et vos devis."
              dark
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Faq q="A qui s'adresse Tarifly ?" a="Aux professionnels qui doivent chiffrer une prestation, un produit ou une offre sur mesure : independants, artisans, consultants, formateurs, createurs et petites entreprises." />
              <Faq q="L'outil remplace-t-il un expert-comptable ?" a="Non. Tarifly vous aide à structurer votre prix de vente et à vérifier votre rentabilité. Pour les décisions comptables, fiscales ou juridiques, votre conseiller reste la référence." />
              <Faq q="Quelles informations dois-je préparer ?" a="Quelques données suffisent : temps estimé, coûts directs, frais, marge souhaitée et taxes éventuelles. L'objectif est d'obtenir rapidement un prix exploitable, sans tableur complexe." />
              <Faq q="Puis-je utiliser le résultat dans mes devis ?" a="Oui. L'accès premium fournit une justification commerciale que vous pouvez reprendre dans vos échanges clients pour présenter un prix plus clair et plus professionnel." />
              <Faq q="Est-ce adapté si mes prestations changent souvent ?" a="Oui. Vous pouvez relancer un calcul pour chaque mission, ajuster vos hypothèses et comparer plusieurs scénarios avant d'envoyer votre proposition." />
              <Faq q="Y a-t-il un abonnement ?" a="Oui. Tarifly Premium est un abonnement mensuel sans engagement. Vous pouvez le résilier depuis votre espace compte." />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
  dark,
}: {
  eyebrow: string;
  title: string;
  description: string;
  dark?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-500">{eyebrow}</p>
      <h2 className={`mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl ${dark ? 'text-white' : 'text-slate-950'}`}>
        {title}
      </h2>
      <p className={`mt-4 max-w-2xl text-lg leading-8 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
  accent = 'blue',
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  accent?: 'blue' | 'aqua' | 'orange';
}) {
  const accents = {
    blue: 'border-brand-100 bg-[linear-gradient(135deg,#ffffff_0%,#eefcff_100%)] text-brand-600',
    aqua: 'border-aqua-100 bg-[linear-gradient(135deg,#ffffff_0%,#ecfffd_100%)] text-aqua-600',
    orange: 'border-orange-100 bg-[linear-gradient(135deg,#ffffff_0%,#fff7ed_100%)] text-orange-500',
  };
  const iconAccents = {
    blue: 'bg-brand-50 text-brand-600',
    aqua: 'bg-aqua-50 text-aqua-600',
    orange: 'bg-orange-50 text-orange-500',
  };

  return (
    <div className={`rounded-2xl border p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${accents[accent]}`}>
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${iconAccents[accent]}`}>{icon}</div>
      <h3 className="mt-5 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="font-semibold">{q}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{a}</p>
    </div>
  );
}
