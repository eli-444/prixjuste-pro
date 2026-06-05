import type { Metadata } from 'next';
import Link from 'next/link';
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
    | { type: 'email'; label: string; email: string }
    | { type: 'internalLink'; text: string; href: string; label: string }
  >;
};

const sections: LegalSection[] = [
  {
    title: '1. Éditeur du service',
    content: [
      { type: 'paragraph', text: 'Le service Tarifly est édité par :' },
      { type: 'paragraph', text: 'Aurora Web & Security, exerçant également sous le nom commercial Aurora Web & Sec.' },
      { type: 'paragraph', text: 'Forme juridique : entrepreneur individuel / micro-entrepreneur.' },
      { type: 'paragraph', text: 'Siège social : 82 rue Anatole France, 69100 Villeurbanne, France.' },
      { type: 'paragraph', text: 'SIREN : 991 249 228.' },
      { type: 'paragraph', text: 'SIRET : 991 249 228 00016.' },
      { type: 'email', label: 'Adresse e-mail de contact', email: 'aurorawebsec@gmail.com' },
      { type: 'paragraph', text: 'Directeur de la publication : Arthur Boda.' },
      {
        type: 'paragraph',
        text: 'Tarifly est une application SaaS destinée aux indépendants, freelances, artisans, prestataires de services et petites entreprises.',
      },
      {
        type: 'paragraph',
        text: 'Elle permet notamment de structurer ses coûts, calculer un prix de vente, comparer un tarif au marché, gérer des opportunités commerciales et générer des devis.',
      },
    ],
  },
  {
    title: '2. Hébergement et nom de domaine',
    content: [
      { type: 'paragraph', text: 'L’application Tarifly est déployée et hébergée par :' },
      { type: 'paragraph', text: 'Vercel Inc.' },
      { type: 'paragraph', text: 'Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.' },
      { type: 'paragraph', text: 'Site internet : vercel.com.' },
      {
        type: 'paragraph',
        text: 'Le nom de domaine et le déploiement technique de l’application sont également gérés via Vercel.',
      },
    ],
  },
  {
    title: '3. Services techniques utilisés',
    content: [
      { type: 'paragraph', text: 'Tarifly utilise plusieurs services techniques pour fonctionner :' },
      {
        type: 'list',
        items: [
          'Supabase, pour l’authentification, les profils utilisateurs et la base de données ;',
          'Stripe, pour les paiements, abonnements, factures et transactions ;',
          'Vercel, pour l’hébergement, le déploiement et le nom de domaine.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Ces prestataires peuvent traiter certaines données nécessaires au fonctionnement du service, dans le cadre de leurs propres conditions et politiques de confidentialité.',
      },
    ],
  },
  {
    title: '4. Données personnelles et cookies',
    content: [
      {
        type: 'paragraph',
        text: 'Tarifly collecte uniquement les données nécessaires au fonctionnement du service : compte utilisateur, informations d’entreprise, informations client, opportunités, calculs, devis, abonnements et données techniques utiles à la sécurité.',
      },
      {
        type: 'paragraph',
        text: 'Ces données servent à fournir le service, sécuriser l’accès au compte, gérer les paiements, générer les devis et améliorer l’expérience utilisateur.',
      },
      {
        type: 'paragraph',
        text: 'Tarifly peut aussi utiliser des cookies ou technologies similaires, notamment pour l’authentification, la sécurité, les préférences utilisateur et, si l’utilisateur l’accepte, certains usages non essentiels.',
      },
      {
        type: 'internalLink',
        text: 'Le détail des traitements, des cookies, des durées de conservation et des droits des utilisateurs est présenté dans la',
        href: '/confidentialite',
        label: 'Politique de confidentialité et cookies',
      },
      {
        type: 'paragraph',
        text: 'Aucun délégué à la protection des données n’a été désigné. Pour toute question relative aux données personnelles ou à l’exercice de vos droits RGPD, vous pouvez contacter l’éditeur.',
      },
      { type: 'email', label: 'Contact RGPD', email: '01 53 73 22 22' },
    ],
  },
  {
    title: '5. Propriété intellectuelle',
    content: [
      {
        type: 'paragraph',
        text: 'Tarifly, son interface, ses fonctionnalités, ses textes, ses éléments graphiques, son logo, son code, sa structure et sa base de données interne sont protégés par le droit de la propriété intellectuelle.',
      },
      {
        type: 'paragraph',
        text: 'Toute reproduction, modification, extraction, réutilisation ou exploitation du service, totale ou partielle, est interdite sans autorisation écrite préalable de l’éditeur.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur reste propriétaire des informations qu’il renseigne dans l’application, notamment ses données d’entreprise, informations client, opportunités, notes, calculs et devis.',
      },
    ],
  },
  {
    title: '6. Responsabilité',
    content: [
      {
        type: 'paragraph',
        text: 'L’éditeur met en œuvre des moyens raisonnables pour assurer l’accès, la sécurité et le bon fonctionnement de Tarifly.',
      },
      {
        type: 'paragraph',
        text: 'Le service peut toutefois être interrompu, ralenti ou indisponible, notamment en cas de maintenance, incident technique ou problème lié à un prestataire externe.',
      },
      {
        type: 'paragraph',
        text: 'Les calculs, marges, comparaisons de marché, prix recommandés et indicateurs affichés par Tarifly sont fournis à titre indicatif.',
      },
      {
        type: 'paragraph',
        text: 'Ils ne remplacent pas un conseil comptable, fiscal, juridique, financier ou commercial personnalisé.',
      },
      { type: 'paragraph', text: 'L’utilisateur reste seul responsable :' },
      {
        type: 'list',
        items: [
          'des prix qu’il applique à ses clients ;',
          'des devis qu’il crée, modifie, envoie ou fait accepter ;',
          'des informations qu’il renseigne dans l’application ;',
          'de l’exactitude de son numéro de SIRET et de ses informations professionnelles ;',
          'de ses obligations fiscales, comptables, sociales, commerciales et légales ;',
          'de la vérification des documents avant toute transmission à un client.',
        ],
      },
      {
        type: 'paragraph',
        text: 'L’éditeur ne peut pas être tenu responsable d’une fausse déclaration, d’une erreur ou d’une usurpation liée au numéro de SIRET ou aux informations professionnelles renseignées par l’utilisateur.',
      },
      {
        type: 'paragraph',
        text: 'L’éditeur ne peut pas être tenu responsable des pertes commerciales, erreurs de prix, erreurs de marge, litiges clients, pertes de chiffre d’affaires ou conséquences liées à une mauvaise utilisation du service.',
      },
    ],
  },
  {
    title: '7. Données de marché',
    content: [
      {
        type: 'paragraph',
        text: 'Les données de marché affichées dans Tarifly sont des estimations. Elles peuvent provenir d’une base interne, de données agrégées ou de données indicatives.',
      },
      {
        type: 'paragraph',
        text: 'Elles peuvent varier selon le métier, la ville, la région, l’unité de facturation, la période et la quantité de données disponibles.',
      },
      {
        type: 'paragraph',
        text: 'Ces données ne garantissent pas le prix réel du marché. Elles ne constituent pas une référence officielle, exhaustive ou opposable.',
      },
    ],
  },
  {
    title: '8. Liens externes',
    content: [
      {
        type: 'paragraph',
        text: 'Tarifly peut contenir des liens vers des sites ou services tiers.',
      },
      {
        type: 'paragraph',
        text: 'L’éditeur ne contrôle pas ces sites et ne peut pas être tenu responsable de leurs contenus, politiques, pratiques ou éventuels dommages liés à leur utilisation.',
      },
    ],
  },
  {
    title: '9. Contact',
    content: [
      {
        type: 'paragraph',
        text: 'Pour toute question relative à Tarifly, vous pouvez contacter l’éditeur à l’adresse suivante :',
      },
      { type: 'email', label: 'Adresse e-mail de contact', email: 'aurorawebsec@gmail.com' },
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

  if (item.type === 'email') {
    return (
      <p>
        {item.label} :{' '}
        <a className="font-semibold text-brand-700 underline-offset-4 hover:underline" href={`mailto:${item.email}`}>
          {item.email}
        </a>
      </p>
    );
  }

  if (item.type === 'internalLink') {
    return (
      <p>
        {item.text}{' '}
        <Link className="font-semibold text-brand-700 underline-offset-4 hover:underline" href={item.href}>
          {item.label}
        </Link>
        .
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
          <p className="mt-4 leading-7 text-slate-600">Dernière mise à jour : 05/06/2026</p>

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
