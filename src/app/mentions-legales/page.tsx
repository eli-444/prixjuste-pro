import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales de Tarifly, application SaaS éditée par Aurora Web & Security.',
  alternates: {
    canonical: '/mentions-legales',
  },
};

type LegalSection = {
  title: string;
  content: Array<
    | { type: 'paragraph'; text: string }
    | { type: 'list'; items: string[] }
    | { type: 'contact'; email: string }
  >;
};

const sections: LegalSection[] = [
  {
    title: '1. Éditeur du service',
    content: [
      { type: 'paragraph', text: 'Le service Tarifly est édité par :' },
      {
        type: 'paragraph',
        text: 'Aurora Web & Security, exerçant également sous le nom commercial Aurora Web & Sec',
      },
      { type: 'paragraph', text: 'Forme juridique : entrepreneur individuel / micro-entrepreneur' },
      { type: 'paragraph', text: 'Siège social : [adresse complète à renseigner], 69100 Villeurbanne, France' },
      { type: 'paragraph', text: 'SIREN : 991 249 228' },
      { type: 'paragraph', text: 'SIRET : 991 249 228 00016' },
      { type: 'contact', email: 'aurorawebsec@gmail.com' },
      { type: 'paragraph', text: 'Directeur de la publication : Arthur Boda' },
      {
        type: 'paragraph',
        text: 'Le service Tarifly est une application SaaS destinée aux indépendants, freelances, artisans, prestataires de services et petites entreprises, permettant notamment de structurer des coûts, calculer des prix de vente, gérer des opportunités commerciales et générer des devis.',
      },
    ],
  },
  {
    title: '2. Hébergement',
    content: [
      { type: 'paragraph', text: 'L’application Tarifly est hébergée par :' },
      { type: 'paragraph', text: 'Vercel Inc.' },
      { type: 'paragraph', text: 'Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis' },
      { type: 'paragraph', text: 'Site internet : vercel.com' },
      {
        type: 'paragraph',
        text: 'Le cas échéant, certains services annexes, tels que le nom de domaine, les DNS ou le site vitrine, peuvent être fournis par :',
      },
      { type: 'paragraph', text: 'OVH SAS / OVHcloud' },
      { type: 'paragraph', text: '2 rue Kellermann' },
      { type: 'paragraph', text: '59100 Roubaix' },
      { type: 'paragraph', text: 'France' },
      { type: 'paragraph', text: 'Site internet : ovhcloud.com' },
    ],
  },
  {
    title: '3. Services techniques tiers',
    content: [
      { type: 'paragraph', text: 'Tarifly utilise notamment les services suivants :' },
      {
        type: 'list',
        items: [
          'Supabase pour l’authentification, la gestion des profils utilisateurs et la base de données ;',
          'Stripe pour la gestion des paiements, abonnements, facturation et transactions ;',
          'Vercel pour l’hébergement et le déploiement de l’application.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Ces prestataires peuvent traiter certaines données nécessaires au fonctionnement du service, conformément à leurs propres conditions et politiques de confidentialité.',
      },
    ],
  },
  {
    title: '4. Propriété intellectuelle',
    content: [
      {
        type: 'paragraph',
        text: 'Le service Tarifly, son interface, ses fonctionnalités, sa structure, ses textes, ses éléments graphiques, son logo, ses composants visuels, son code, sa base de données interne et plus généralement l’ensemble des contenus accessibles depuis l’application sont protégés par le droit de la propriété intellectuelle.',
      },
      {
        type: 'paragraph',
        text: 'Sauf autorisation écrite préalable de l’éditeur, toute reproduction, représentation, modification, extraction, réutilisation, adaptation ou exploitation totale ou partielle du service ou de ses contenus est interdite.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur conserve la responsabilité et les droits éventuels sur les contenus qu’il renseigne dans l’application, notamment ses informations d’entreprise, informations client, opportunités commerciales, données de calcul, notes et devis générés.',
      },
    ],
  },
  {
    title: '5. Responsabilité',
    content: [
      {
        type: 'paragraph',
        text: 'L’éditeur met en œuvre des efforts raisonnables pour assurer l’accessibilité, la sécurité et le bon fonctionnement de Tarifly.',
      },
      {
        type: 'paragraph',
        text: 'Toutefois, l’éditeur ne garantit pas que le service sera accessible de manière ininterrompue, exempt d’erreurs, ou compatible avec tous les environnements techniques, navigateurs, appareils ou configurations.',
      },
      {
        type: 'paragraph',
        text: 'Tarifly fournit des calculs, estimations, comparaisons de marché, marges, prix recommandés et indicateurs de rentabilité à titre strictement indicatif. Ces informations ne constituent ni un conseil comptable, ni un conseil juridique, ni un conseil fiscal, ni un conseil financier, ni une recommandation commerciale personnalisée.',
      },
      { type: 'paragraph', text: 'L’utilisateur reste seul responsable :' },
      {
        type: 'list',
        items: [
          'des prix qu’il applique à ses clients ;',
          'des devis qu’il génère, modifie, transmet ou accepte ;',
          'de ses obligations fiscales, comptables, sociales, commerciales et légales ;',
          'de la vérification des informations avant toute transmission à un client ;',
          'de l’usage qu’il fait des données, résultats et documents générés par Tarifly.',
        ],
      },
      {
        type: 'paragraph',
        text: 'L’éditeur ne saurait être tenu responsable des pertes commerciales, pertes de chiffre d’affaires, erreurs de prix, erreurs de marge, litiges clients, obligations fiscales non respectées ou conséquences liées à une mauvaise utilisation du service.',
      },
    ],
  },
  {
    title: '6. Données de marché',
    content: [
      {
        type: 'paragraph',
        text: 'Les données de marché affichées dans Tarifly sont des estimations issues d’une base de données interne, de données agrégées ou de données indicatives. Elles peuvent être incomplètes, variables selon les périodes, régions, villes, métiers, unités de facturation ou méthodes de calcul.',
      },
      {
        type: 'paragraph',
        text: 'Elles ne garantissent pas le prix réel du marché et ne doivent pas être considérées comme une référence officielle, exhaustive ou opposable.',
      },
    ],
  },
  {
    title: '7. Liens externes',
    content: [
      {
        type: 'paragraph',
        text: 'L’application peut contenir des liens vers des sites ou services tiers. L’éditeur n’exerce aucun contrôle sur ces sites et ne saurait être responsable de leurs contenus, politiques, pratiques ou éventuels dommages résultant de leur utilisation.',
      },
    ],
  },
  {
    title: '8. Contact',
    content: [
      {
        type: 'paragraph',
        text: 'Pour toute question relative au service Tarifly, l’utilisateur peut contacter l’éditeur à l’adresse suivante :',
      },
      { type: 'contact', email: 'aurorawebsec@gmail.com' },
    ],
  },
];

function LegalContent({ item }: { item: LegalSection['content'][number] }) {
  if (item.type === 'list') {
    return (
      <ul className="list-disc space-y-2 pl-5">
        {item.items.map((listItem) => (
          <li key={listItem}>{listItem}</li>
        ))}
      </ul>
    );
  }

  if (item.type === 'contact') {
    return (
      <p>
        Adresse e-mail de contact :{' '}
        <a className="font-semibold text-brand-700 underline-offset-4 hover:underline" href={`mailto:${item.email}`}>
          {item.email}
        </a>
      </p>
    );
  }

  return <p>{item.text}</p>;
}

export default function LegalPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <article className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-soft md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Informations légales</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Mentions légales</h1>
          <p className="mt-4 leading-7 text-slate-600">Dernière mise à jour : 03/06/2026</p>

          <div className="mt-8 divide-y divide-slate-200">
            {sections.map((section) => (
              <section key={section.title} className="py-6 first:pt-0 last:pb-0">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">{section.title}</h2>
                <div className="mt-3 space-y-3 leading-7 text-slate-600">
                  {section.content.map((item, index) => (
                    <LegalContent key={`${section.title}-${index}`} item={item} />
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
