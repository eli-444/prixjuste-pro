import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

const sections = [
  {
    title: 'Editeur du site',
    body: [
      'Tarifly est edite par Aurora Web & Security.',
      'SIRET : 99124922800016.',
      'Adresse du siege social : a completer avant publication definitive.',
      'Telephone : a completer avant publication definitive.',
      'Email de contact : aurorawebsec@gmail.com.',
      'Directeur de la publication : a completer avant publication definitive.',
    ],
  },
  {
    title: 'Hebergement',
    body: [
      'Le site est heberge par Vercel Inc.',
      'Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, Etats-Unis.',
      'Site : https://vercel.com.',
    ],
  },
  {
    title: 'Service propose',
    body: [
      'Tarifly propose un calculateur d aide a la fixation de prix pour professionnels et independants.',
      'Les resultats fournis sont indicatifs. Ils ne constituent pas un conseil comptable, fiscal, juridique ou financier.',
      'L utilisateur reste responsable de ses hypotheses, de ses prix, de ses devis et de ses decisions commerciales.',
    ],
  },
  {
    title: 'Paiement et abonnement',
    body: [
      'Tarifly Premium est commercialise sous forme d abonnement mensuel.',
      'Les paiements sont traites par Stripe. Tarifly ne stocke pas les donnees completes de carte bancaire.',
      'L abonnement peut etre gere et resilie depuis l espace compte de l utilisateur, via le portail securise Stripe.',
    ],
  },
  {
    title: 'Donnees personnelles',
    body: [
      'Les donnees traitees peuvent inclure l email du compte, les informations de profil, les calculs sauvegardes et les informations necessaires au suivi de l abonnement.',
      'Les donnees sont utilisees pour fournir le service, gerer l authentification, traiter les paiements et assurer le support utilisateur.',
      'Pour exercer vos droits d acces, de rectification, d effacement ou d opposition, contactez : aurorawebsec@gmail.com.',
    ],
  },
  {
    title: 'Propriete intellectuelle',
    body: [
      'Les textes, interfaces, logos, elements graphiques et contenus du site sont proteges par le droit de la propriete intellectuelle.',
      'Toute reproduction ou exploitation non autorisee est interdite.',
    ],
  },
];

export default function LegalPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <article className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-soft md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Informations legales</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Mentions legales</h1>
          <p className="mt-4 leading-7 text-slate-600">Derniere mise a jour : 30 mai 2026.</p>

          <div className="mt-8 divide-y divide-slate-200">
            {sections.map((section) => (
              <section key={section.title} className="py-6 first:pt-0 last:pb-0">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">{section.title}</h2>
                <div className="mt-3 space-y-2 leading-7 text-slate-600">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
