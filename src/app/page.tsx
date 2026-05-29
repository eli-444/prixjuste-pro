import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  Timer,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PricingCard } from '@/components/PricingCard';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-100">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                Calculateur de prix rentable pour professionnels
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                Fixez le bon tarif avant d'envoyer votre devis.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Tarifly transforme vos coûts, votre temps, vos frais et votre objectif de marge en un prix clair,
                défendable et rentable. Vous gagnez du temps, vous sécurisez votre marge et vous présentez un tarif
                cohérent à vos clients.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/outil" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800">
                  Calculer mon prix
                  <ArrowRight size={16} />
                </Link>
                <Link href="#tarifs" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-50">
                  Voir l'offre
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="rounded-3xl bg-slate-950 p-6 text-white">
                <p className="text-sm text-slate-300">Prix recommandé</p>
                <p className="mt-2 text-5xl font-bold">395 €</p>
                <div className="mt-6 grid gap-3 text-sm">
                  <PreviewMetric label="Coûts intégrés" value="100 %" />
                  <PreviewMetric label="Marge estimée" value="36 %" />
                  <PreviewMetric label="Lecture du risque" value="Faible" />
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600">
                Obtenez un prix recommandé, une lecture de rentabilité et une justification commerciale prête à reprendre
                dans votre proposition.
              </p>
            </div>
          </div>
        </section>

        <section id="fonctionnement" className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              eyebrow="Méthode"
              title="Un calcul simple pour une décision de prix plus solide."
              description="Tarifly remet de la méthode dans une décision souvent prise trop vite : combien facturer sans rogner sa marge ni perdre en crédibilité commerciale."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <Feature icon={<Timer />} title="1. Renseignez vos données" text="Temps prévu, coûts directs, frais, taux horaire, marge souhaitée et taxes éventuelles." />
              <Feature icon={<BarChart3 />} title="2. Analysez votre rentabilité" text="L'outil calcule un prix recommandé et met en évidence la marge réelle de votre prestation." />
              <Feature icon={<FileText />} title="3. Présentez un tarif clair" text="Vous repartez avec une formulation professionnelle pour expliquer votre prix sans vous justifier maladroitement." />
            </div>
          </div>
        </section>

        <section id="cibles" className="bg-slate-100 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              eyebrow="Profils"
              title="Pensé pour ceux qui vendent leur temps, leur savoir-faire ou une prestation sur mesure."
              description="Que vous soyez indépendant, artisan, consultant ou dirigeant de TPE, l'enjeu reste le même : vendre au bon prix, avec une marge maîtrisée."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-4">
              {['Freelances', 'Artisans', 'Consultants', 'Créateurs', 'Formateurs', 'Coachings', 'Prestataires', 'TPE'].map((target) => (
                <div key={target} className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-slate-800">
                  {target}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              eyebrow="Valeur"
              title="Arrêtez de fixer vos prix au feeling."
              description="Un prix trop bas fatigue votre activité. Un prix mal expliqué fragilise la vente. Tarifly vous aide à poser un tarif argumenté, lisible et cohérent avec vos objectifs."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <Feature icon={<ShieldCheck />} title="Protéger votre marge" text="Chaque prix tient compte de vos coûts réels, de votre temps et du niveau de rentabilité attendu." />
              <Feature icon={<Sparkles />} title="Gagner en crédibilité" text="Vous présentez un tarif structuré, moins improvisé, plus facile à assumer face au client." />
              <Feature icon={<CheckCircle2 />} title="Décider plus vite" text="Vous remplacez les hésitations et les calculs dispersés par une recommandation exploitable immédiatement." />
            </div>
          </div>
        </section>

        <section id="tarifs" className="bg-slate-100 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionTitle
                eyebrow="Accès"
                title="Un achat unique pour mieux chiffrer vos prochaines prestations."
                description="Testez le calcul gratuitement, puis débloquez le diagnostic complet lorsque vous voulez exploiter le résultat dans vos devis et échanges clients."
              />
              <div className="mt-8 space-y-4">
                {[
                  'Calcul gratuit pour obtenir une première estimation.',
                  'Diagnostic complet pour comprendre votre marge et votre niveau de risque.',
                  'Texte de justification professionnel pour accompagner votre proposition.',
                ].map((item) => (
                  <p key={item} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-brand-600" />
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
              title="Questions fréquentes"
              description="Les réponses essentielles avant d'utiliser Tarifly pour préparer vos prix et vos devis."
              dark
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Faq q="À qui s'adresse Tarifly ?" a="Aux professionnels qui doivent chiffrer une prestation, un produit ou une offre sur mesure : indépendants, artisans, consultants, formateurs, créateurs et petites entreprises." />
              <Faq q="L'outil remplace-t-il un expert-comptable ?" a="Non. Tarifly vous aide à structurer votre prix de vente et à vérifier votre rentabilité. Pour les décisions comptables, fiscales ou juridiques, votre conseiller reste la référence." />
              <Faq q="Quelles informations dois-je préparer ?" a="Quelques données suffisent : temps estimé, coûts directs, frais, marge souhaitée et taxes éventuelles. L'objectif est d'obtenir rapidement un prix exploitable, sans tableur complexe." />
              <Faq q="Puis-je utiliser le résultat dans mes devis ?" a="Oui. L'accès premium fournit une justification commerciale que vous pouvez reprendre dans vos échanges clients pour présenter un prix plus clair et plus professionnel." />
              <Faq q="Est-ce adapté si mes prestations changent souvent ?" a="Oui. Vous pouvez relancer un calcul pour chaque mission, ajuster vos hypothèses et comparer plusieurs scénarios avant d'envoyer votre proposition." />
              <Faq q="Y a-t-il un abonnement ?" a="Non. L'accès premium fonctionne avec un paiement unique, pensé pour débloquer les informations utiles sans engagement récurrent." />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-2xl bg-white/10 px-4 py-3">
      <span className="text-slate-300">{label}</span>
      <span className="font-semibold">{value}</span>
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
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-500">{eyebrow}</p>
      <h2 className={`mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl ${dark ? 'text-white' : 'text-slate-950'}`}>
        {title}
      </h2>
      <p className={`mt-4 max-w-2xl text-lg leading-8 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</div>
      <h3 className="mt-5 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="font-semibold">{q}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{a}</p>
    </div>
  );
}
