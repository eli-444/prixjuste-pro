import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, BarChart3, CheckCircle2, CircleCheck, FileSignature, FileText, LineChart, Link2, Timer, TrendingUp } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PricingCard } from '@/components/PricingCard';
import { AuthCodeRedirect } from '@/components/AuthCodeRedirect';

export const metadata: Metadata = {
  title: 'Logiciel de calcul de prix, comparaison marché et devis pour indépendants',
  description:
    'Tarifly aide les indépendants, artisans, freelances et TPE à calculer un prix rentable, comparer leur tarif au marché, générer des devis professionnels et suivre les réponses clients.',
  alternates: {
    canonical: '/',
  },
};

const faqItems = [
  {
    question: "À qui s'adresse Tarifly ?",
    answer:
      'Aux indépendants, artisans, freelances, consultants, prestataires de services et petites entreprises qui doivent chiffrer une mission, protéger leur marge et envoyer un devis clair.',
  },
  {
    question: 'Tarifly remplace-t-il un expert-comptable ?',
    answer:
      'Non. Tarifly structure un prix de vente, une marge et une comparaison indicative au marché. Pour les décisions comptables, fiscales ou juridiques, un conseiller spécialisé reste la référence.',
  },
  {
    question: 'Les données de marché sont-elles fiables ?',
    answer:
      'Elles sont indicatives et servent à situer un prix selon le métier, la région, la ville et l’unité de facturation. Les statistiques utilisateurs sont alimentées uniquement par les devis acceptés.',
  },
  {
    question: 'Le client doit-il créer un compte pour signer ?',
    answer:
      'Non. Vous pouvez envoyer un lien public : le client consulte le devis, le télécharge, le signe électroniquement puis l’accepte ou le refuse sans compte Tarifly.',
  },
  {
    question: 'Puis-je suivre mes devis après envoi ?',
    answer:
      'Oui. Le dashboard permet de suivre les opportunités, les devis envoyés, les acceptations, les refus, les performances commerciales et le portefeuille client.',
  },
  {
    question: 'Y a-t-il un engagement ?',
    answer:
      'Non. Tarifly Premium est un abonnement mensuel sans engagement, résiliable à tout moment depuis votre espace compte.',
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
    image: 'https://tarifly.vercel.app/logo.png',
    description:
      'Logiciel SaaS pour calculer un prix rentable, comparer son tarif au marché, générer des devis professionnels, envoyer un lien client et suivre les acceptations ou refus.',
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
      'Génération de devis professionnels',
      'Lien public client',
      'Signature électronique',
      'Suivi accepté/refusé',
      'Dashboard commercial',
      'Export PDF',
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

const trustItems = [
  'Sans engagement',
  'Résiliable à tout moment',
  'Devis consultable sans compte client',
  'Statistiques basées sur les devis acceptés',
];

const pillars = [
  {
    icon: <Timer size={20} />,
    title: 'Calculer un prix rentable',
    text: 'Tarifly prend en compte vos coûts réels, votre temps de travail, vos frais fixes, la TVA, vos frais de paiement et votre niveau de marge pour produire un prix exploitable.',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Comparer au marché',
    text: 'Situez votre prix avec des données indicatives selon le métier, la région, la ville et l’unité de facturation, afin d’éviter les écarts trop risqués.',
  },
  {
    icon: <FileSignature size={20} />,
    title: 'Envoyer un devis professionnel',
    text: 'Transformez votre calcul en devis propre, partageable par lien, téléchargeable, signable et acceptable ou refusable par le client.',
  },
];

const steps = [
  'Renseignez vos coûts et votre temps de travail.',
  'Obtenez un prix conseillé et une analyse de marge.',
  'Comparez votre prix au marché.',
  'Générez un devis professionnel.',
  'Envoyez le lien au client et suivez sa réponse.',
];

const premiumFeatures = [
  'Calculs complets pour chiffrer vos prestations',
  'Diagnostic de marge et lecture du risque commercial',
  'Comparaison marché par métier, région, ville et unité',
  'Génération de devis professionnels',
  'Lien public client sans création de compte',
  'Signature électronique et réponse accepté/refusé',
  'Dashboard commercial et suivi des opportunités',
  'Export PDF professionnel',
  'Abonnement mensuel sans engagement',
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
      <main className="overflow-hidden bg-[#f6f9fc] text-slate-950">
        <section className="relative border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#eefcff_56%,#f6f9fc_100%)]">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-brand-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand-600 shadow-sm">
                Prix, marché, devis et suivi client
              </div>
              <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.03] tracking-tight text-brand-900 md:text-6xl">
                Fixez un prix rentable, comparez-le au marché et envoyez un devis prêt à signer.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                Tarifly aide les indépendants, artisans, freelances et petites entreprises à calculer leurs prix, protéger leur marge, générer des devis professionnels et suivre les réponses clients.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/outil" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-4 text-sm font-black text-white shadow-glow transition hover:bg-brand-900">
                  Calculer mon prix
                  <ArrowRight size={16} />
                </Link>
                <Link href="#exemple" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-black text-brand-900 shadow-sm transition hover:border-brand-100 hover:text-brand-600">
                  Voir un exemple de devis
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-2">
                {trustItems.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <HeroMockup />
          </div>
        </section>

        <section id="fonctionnement" className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              eyebrow="Méthode"
              title="Une décision de prix plus solide, du calcul jusqu’à la signature."
              description="Tarifly relie les données que vous renseignez, l’analyse de marge, la comparaison marché, le devis et le suivi client dans un seul parcours."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {pillars.map((pillar, index) => (
                <ProductCard key={pillar.title} index={index + 1} icon={pillar.icon} title={pillar.title} text={pillar.text} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f6f9fc] py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionTitle
                eyebrow="Comment ça fonctionne"
                title="Cinq étapes pour passer d’une mission à un devis suivi."
                description="Le parcours reste volontairement simple : vous renseignez les éléments utiles, Tarifly structure le prix, puis vous envoyez une proposition propre."
              />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft md:p-6">
              <div className="grid gap-3">
                {steps.map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-sm font-black text-white">{index + 1}</span>
                    <p className="pt-1 font-bold text-brand-900">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="cibles" className="bg-white py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <SectionTitle
                eyebrow="Pour qui ?"
                title="Pensé pour les professionnels qui vendent du temps, du savoir-faire ou une prestation sur mesure."
                description="Freelances, artisans, consultants, formateurs, prestataires et TPE : Tarifly aide à défendre un tarif cohérent sans transformer chaque devis en tableur."
              />
              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                {['Indépendants', 'Artisans', 'Freelances', 'Consultants', 'Créateurs', 'Formateurs', 'Prestataires', 'TPE'].map((target) => (
                  <div key={target} className="rounded-2xl border border-slate-200 bg-[#f8fbff] px-5 py-4 font-black text-brand-900 shadow-sm">
                    {target}
                  </div>
                ))}
              </div>
            </div>
            <MiniDashboardMockup />
          </div>
        </section>

        <section id="exemple" className="bg-[linear-gradient(180deg,#eefcff_0%,#f6f9fc_100%)] py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              eyebrow="Exemple de résultat Tarifly"
              title="Un résultat concret, prêt à transformer en devis."
              description="Le visiteur doit voir ce que Tarifly produit réellement : un prix, une marge, un positionnement marché et un suivi commercial."
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ResultLine label="Métier" value="Développeur web" />
                  <ResultLine label="Ville" value="Lyon" />
                  <ResultLine label="Mission" value="Landing page professionnelle" />
                  <ResultLine label="Temps estimé" value="12 h" />
                  <ResultLine label="Coûts directs" value="80 €" />
                  <ResultLine label="Frais fixes estimés" value="45 €" />
                </div>
              </div>
              <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
                <div className="grid gap-4 sm:grid-cols-2">
                  <MetricCard label="Prix recommandé" value="950 € HT" tone="blue" />
                  <MetricCard label="Marge estimée" value="38 %" tone="aqua" />
                  <MetricCard label="Position marché" value="Cohérente" tone="green" />
                  <MetricCard label="Statut devis" value="Accepté" tone="green" />
                </div>
                <div className="mt-5 rounded-2xl border border-aqua-100 bg-aqua-50 p-4 text-sm font-semibold leading-6 text-teal-950">
                  Ce prix pourra alimenter les données marché uniquement si le devis est accepté.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-5 shadow-soft">
              <QuotePreview />
            </div>
            <div>
              <SectionTitle
                eyebrow="Devis client"
                title="Un lien public pour faire avancer la décision."
                description="Le client consulte le devis sans compte, télécharge le PDF, signe électroniquement puis accepte ou refuse. Vous suivez la réponse depuis votre dashboard."
              />
              <div className="mt-8 grid gap-4">
                <TrustRow icon={<Link2 size={18} />} title="Lien partageable" text="Envoyez le devis sans demander au client de créer un compte." />
                <TrustRow icon={<FileText size={18} />} title="Export PDF professionnel" text="Le document reste téléchargeable et présentable." />
                <TrustRow icon={<CircleCheck size={18} />} title="Statut automatiquement mis à jour" text="Accepté ou refusé, le suivi commercial reste propre." />
              </div>
            </div>
          </div>
        </section>

        <section id="tarifs" className="bg-[#061747] py-16 text-white md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <SectionTitle
                eyebrow="Tarifs"
                title="Un abonnement mensuel pour mieux chiffrer et mieux convertir."
                description="Un seul devis mieux tarifé peut rentabiliser plusieurs mois d’abonnement."
                dark
              />
              <div className="mt-8 grid gap-3">
                {premiumFeatures.map((feature) => (
                  <p key={feature} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-semibold leading-6 text-slate-100">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-aqua-500" />
                    {feature}
                  </p>
                ))}
              </div>
            </div>
            <PricingCard />
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              eyebrow="FAQ"
              title="Questions fréquentes"
              description="Les réponses essentielles avant d’utiliser Tarifly pour préparer vos prix, vos devis et votre suivi commercial."
              dark
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {faqItems.map((item) => (
                <Faq key={item.question} q={item.question} a={item.answer} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function HeroMockup() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Mission</p>
          <p className="mt-1 text-lg font-black text-brand-900">Site vitrine professionnel</p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">En attente</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetricCard label="Prix recommandé" value="1 240 € HT" tone="blue" />
        <MetricCard label="Marge estimée" value="34 %" tone="aqua" />
        <MetricCard label="Position marché" value="Moyenne haute" tone="navy" />
        <MetricCard label="Risque commercial" value="Modéré" tone="amber" />
      </div>
      <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Devis</p>
            <p className="mt-1 text-xl font-black text-brand-900">Prêt à envoyer</p>
          </div>
          <FileSignature className="h-9 w-9 text-brand-600" />
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#0878f2,#11cfc2)]" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-700">Statut client : en attente de signature</p>
      </div>
    </div>
  );
}

function MiniDashboardMockup() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Dashboard</p>
          <p className="mt-1 text-xl font-black text-brand-900">Suivi commercial</p>
        </div>
        <LineChart className="h-8 w-8 text-aqua-600" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Envoyés" value="18" tone="blue" compact />
        <MetricCard label="Acceptés" value="11" tone="green" compact />
        <MetricCard label="Refusés" value="3" tone="red" compact />
      </div>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-black text-brand-900">Performance mensuelle</p>
          <TrendingUp className="h-5 w-5 text-brand-600" />
        </div>
        <div className="flex h-36 items-end gap-3">
          {[42, 68, 55, 88, 74, 96].map((height, index) => (
            <div key={height} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-xl bg-[linear-gradient(180deg,#0878f2,#11cfc2)]" style={{ height: `${height}%` }} />
              <span className="text-[10px] font-black uppercase text-slate-400">{['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'][index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuotePreview() {
  return (
    <div className="rounded-2xl bg-white p-5 text-xs shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-600">Tarifly</p>
          <p className="mt-2 font-black text-brand-900">Aurora Web & Security</p>
          <p className="mt-1 text-slate-500">Villeurbanne, France</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-brand-900">DEVIS</p>
          <p className="mt-1 font-bold text-slate-500">DV-2026-014</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="font-black text-brand-600">CLIENT</p>
          <p className="mt-2 font-black text-slate-950">Studio Martin</p>
          <p className="text-slate-500">Landing page professionnelle</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="font-black text-brand-600">VALIDITÉ</p>
          <p className="mt-2 font-black text-slate-950">30 jours</p>
          <p className="text-slate-500">Signature en ligne</p>
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-[1fr_90px_90px] bg-brand-600 px-3 py-2 font-black text-white">
          <span>Désignation</span>
          <span className="text-right">Qté</span>
          <span className="text-right">Total HT</span>
        </div>
        <div className="grid grid-cols-[1fr_90px_90px] border-t border-slate-200 px-3 py-3 text-slate-700">
          <span>Conception et intégration</span>
          <span className="text-right">1</span>
          <span className="text-right font-black">950 €</span>
        </div>
      </div>
      <div className="ml-auto mt-5 w-full max-w-xs overflow-hidden rounded-xl border border-slate-200">
        <div className="flex justify-between px-4 py-3">
          <span>Total HT</span>
          <strong>950 €</strong>
        </div>
        <div className="flex justify-between bg-brand-600 px-4 py-3 font-black text-white">
          <span>Total TTC</span>
          <span>1 140 €</span>
        </div>
      </div>
    </div>
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
      <p className="text-sm font-black uppercase tracking-[0.2em] text-aqua-600">{eyebrow}</p>
      <h2 className={`mt-3 max-w-3xl text-3xl font-black tracking-tight md:text-5xl ${dark ? 'text-white' : 'text-brand-900'}`}>
        {title}
      </h2>
      <p className={`mt-4 max-w-2xl text-lg leading-8 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{description}</p>
    </div>
  );
}

function ProductCard({ index, icon, title, text }: { index: number; icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</span>
        <span className="text-sm font-black text-aqua-600">0{index}</span>
      </div>
      <h3 className="mt-6 text-xl font-black text-brand-900">{title}</h3>
      <p className="mt-3 leading-7 text-slate-700">{text}</p>
    </div>
  );
}

function MetricCard({ label, value, tone, compact }: { label: string; value: string; tone: 'blue' | 'aqua' | 'green' | 'amber' | 'navy' | 'red'; compact?: boolean }) {
  const tones = {
    blue: 'border-brand-100 bg-brand-50 text-brand-900',
    aqua: 'border-aqua-100 bg-aqua-50 text-teal-950',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-950',
    amber: 'border-amber-100 bg-amber-50 text-amber-950',
    navy: 'border-slate-200 bg-slate-50 text-brand-900',
    red: 'border-red-100 bg-red-50 text-red-950',
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`${compact ? 'mt-2 text-2xl' : 'mt-3 text-3xl'} font-black tracking-tight`}>{value}</p>
    </div>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 font-black text-brand-900">{value}</p>
    </div>
  );
}

function TrustRow({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
      <div>
        <h3 className="font-black text-brand-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
      <h3 className="font-black">{q}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{a}</p>
    </div>
  );
}
