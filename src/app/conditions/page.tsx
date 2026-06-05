import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Conditions Générales d’Utilisation et de Vente',
  description: 'Conditions Générales d’Utilisation et de Vente de Tarifly, abonnement mensuel et service SaaS.',
  alternates: {
    canonical: '/conditions',
  },
};

type ConditionContent =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'email'; label: string; email: string }
  | { type: 'internalLink'; text: string; href: string; label: string };

type ConditionSection = {
  title: string;
  content: ConditionContent[];
};

const sections: ConditionSection[] = [
  {
    title: '1. Objet',
    content: [
      {
        type: 'paragraph',
        text: 'Les présentes Conditions Générales d’Utilisation et de Vente, appelées ci-après les « Conditions », encadrent l’accès, l’utilisation, la souscription et le paiement du service Tarifly.',
      },
      {
        type: 'paragraph',
        text: 'Tarifly est une application SaaS qui aide les indépendants, freelances, artisans, prestataires de services et petites entreprises à calculer leurs prix, suivre leurs opportunités commerciales et générer des devis professionnels.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisation du service implique l’acceptation des présentes Conditions.',
      },
    ],
  },
  {
    title: '2. Éditeur du service',
    content: [
      { type: 'paragraph', text: 'Le service Tarifly est édité par :' },
      { type: 'paragraph', text: 'Aurora Web & Security, exerçant également sous le nom commercial Aurora Web & Sec.' },
      { type: 'paragraph', text: 'Forme juridique : entrepreneur individuel / micro-entrepreneur.' },
      { type: 'paragraph', text: 'Siège social : 82 rue Anatole France, 69100 Villeurbanne, France.' },
      { type: 'paragraph', text: 'SIREN : 991 249 228.' },
      { type: 'paragraph', text: 'SIRET : 991 249 228 00016.' },
      { type: 'email', label: 'Contact', email: 'aurorawebsec@gmail.com' },
    ],
  },
  {
    title: '3. Définitions',
    content: [
      { type: 'paragraph', text: 'Dans les présentes Conditions :' },
      {
        type: 'list',
        items: [
          'Service : l’application Tarifly et ses fonctionnalités.',
          'Utilisateur : toute personne qui utilise Tarifly.',
          'Client : tout utilisateur ayant souscrit une offre payante.',
          'Compte : espace personnel permettant d’accéder au service.',
          'Abonnement Premium : abonnement mensuel payant donnant accès aux fonctionnalités de Tarifly.',
          'Données utilisateur : informations renseignées dans Tarifly, notamment les informations d’entreprise, clients, opportunités, calculs, devis et notes.',
          'Données de marché : estimations indicatives utilisées pour comparer un prix avec une tendance de marché.',
        ],
      },
    ],
  },
  {
    title: '4. Accès au service',
    content: [
      {
        type: 'paragraph',
        text: 'L’accès aux fonctionnalités principales de Tarifly nécessite un compte utilisateur et un abonnement Premium actif, sauf accès exceptionnel ou offre promotionnelle indiquée par l’éditeur.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur doit fournir des informations exactes, complètes et à jour lors de la création de son compte et pendant l’utilisation du service.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur est responsable de la confidentialité de ses identifiants. Toute utilisation de son compte est réputée effectuée par lui, sauf preuve contraire.',
      },
      {
        type: 'paragraph',
        text: 'En cas d’accès non autorisé, d’utilisation suspecte ou de perte d’identifiants, l’utilisateur doit contacter l’éditeur dès que possible.',
      },
      { type: 'email', label: 'Contact support', email: 'aurorawebsec@gmail.com' },
    ],
  },
  {
    title: '5. Fonctionnalités',
    content: [
      { type: 'paragraph', text: 'Tarifly permet notamment de :' },
      {
        type: 'list',
        items: [
          'renseigner ses informations d’entreprise ;',
          'enregistrer des clients et opportunités commerciales ;',
          'saisir les coûts réels d’une mission ;',
          'calculer un prix de vente, une marge et un niveau de rentabilité ;',
          'comparer un prix à des données indicatives de marché ;',
          'générer un résumé PDF interne ;',
          'générer un devis PDF destiné au client ;',
          'envoyer un lien public de consultation, signature, acceptation ou refus du devis ;',
          'exporter certaines données en CSV ;',
          'suivre ses devis, clients, démarches commerciales et performances depuis un dashboard ;',
          'gérer son abonnement et sa facturation.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Les fonctionnalités peuvent évoluer. L’éditeur peut ajouter, modifier ou supprimer certaines fonctionnalités pour améliorer le service, corriger un problème ou respecter une obligation légale.',
      },
    ],
  },
  {
    title: '6. Abonnement Premium',
    content: [
      {
        type: 'paragraph',
        text: 'Tarifly est proposé sous forme d’abonnement mensuel Premium.',
      },
      {
        type: 'paragraph',
        text: 'Le prix de l’abonnement Tarifly Premium est de 9,90 EUR TTC par mois.',
      },
      {
        type: 'paragraph',
        text: 'Le prix est affiché avant la souscription. L’abonnement est renouvelé automatiquement chaque mois jusqu’à sa résiliation.',
      },
      {
        type: 'paragraph',
        text: 'L’éditeur peut modifier le prix de l’abonnement pour les nouvelles souscriptions. Si une modification concerne un abonnement existant, l’utilisateur en est informé avant son application.',
      },
    ],
  },
  {
    title: '7. Paiement et facturation',
    content: [
      {
        type: 'paragraph',
        text: 'Les paiements sont traités par Stripe, prestataire de paiement tiers.',
      },
      {
        type: 'paragraph',
        text: 'L’éditeur ne stocke pas les données complètes de carte bancaire. Ces données sont traitées par Stripe selon ses propres conditions et politiques.',
      },
      {
        type: 'paragraph',
        text: 'En souscrivant à l’abonnement Premium, l’utilisateur autorise le prélèvement mensuel du montant indiqué lors de la souscription.',
      },
      {
        type: 'paragraph',
        text: 'En cas d’échec de paiement, de moyen de paiement expiré ou d’incident de facturation, l’accès Premium peut être suspendu ou limité jusqu’à régularisation.',
      },
      {
        type: 'paragraph',
        text: 'Les factures et informations de paiement disponibles sont accessibles depuis l’espace Facturation ou le portail Stripe lorsque celui-ci est proposé.',
      },
    ],
  },
  {
    title: '8. Résiliation',
    content: [
      {
        type: 'paragraph',
        text: 'L’utilisateur peut résilier son abonnement Premium depuis son compte ou depuis le portail de facturation mis à disposition dans l’application.',
      },
      {
        type: 'paragraph',
        text: 'La résiliation prend effet à la fin de la période d’abonnement en cours, sauf obligation légale contraire.',
      },
      {
        type: 'paragraph',
        text: 'La période déjà payée reste accessible jusqu’à son échéance. Elle n’est pas remboursée au prorata, sauf obligation légale contraire ou décision commerciale exceptionnelle de l’éditeur.',
      },
      {
        type: 'paragraph',
        text: 'L’éditeur peut suspendre ou fermer l’accès au service en cas d’impayé, fraude, usage abusif, atteinte à la sécurité du service ou violation des présentes Conditions.',
      },
    ],
  },
  {
    title: '9. Droit de rétractation',
    content: [
      {
        type: 'paragraph',
        text: 'Lorsque l’utilisateur agit en qualité de consommateur et que le droit de rétractation est applicable, il dispose en principe d’un délai de 14 jours pour se rétracter après la souscription à distance.',
      },
      {
        type: 'paragraph',
        text: 'Si l’utilisateur demande l’accès immédiat au service numérique avant la fin du délai de rétractation, il peut lui être demandé de reconnaître que l’exécution du service commence immédiatement et que son droit de rétractation peut être limité ou écarté dans les conditions prévues par la loi.',
      },
      {
        type: 'paragraph',
        text: 'Lorsque l’utilisateur agit exclusivement dans le cadre de son activité professionnelle, les règles propres au droit de rétractation des consommateurs ne s’appliquent pas, sauf disposition légale contraire.',
      },
      {
        type: 'paragraph',
        text: 'Toute demande liée au droit de rétractation peut être adressée à l’éditeur par e-mail.',
      },
      { type: 'email', label: 'Contact rétractation', email: 'aurorawebsec@gmail.com' },
    ],
  },
  {
    title: '10. Nature indicative des résultats',
    content: [
      {
        type: 'paragraph',
        text: 'Les calculs, marges, prix recommandés, comparaisons de marché, indicateurs de rentabilité et analyses affichés par Tarifly sont fournis à titre indicatif.',
      },
      {
        type: 'paragraph',
        text: 'Tarifly n’est pas un cabinet comptable, un expert-comptable, un avocat, un conseiller fiscal, un conseiller financier ou un conseiller commercial personnalisé.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur reste seul responsable de ses prix, devis, décisions commerciales, obligations fiscales, obligations comptables et obligations légales.',
      },
      {
        type: 'paragraph',
        text: 'L’éditeur ne garantit pas que les résultats affichés permettront d’obtenir une marge, un chiffre d’affaires, une rentabilité ou une réussite commerciale déterminée.',
      },
    ],
  },
  {
    title: '11. Données de marché',
    content: [
      {
        type: 'paragraph',
        text: 'Les données de marché affichées dans Tarifly sont des estimations. Elles peuvent provenir d’une base interne, de données agrégées ou de données indicatives.',
      },
      {
        type: 'paragraph',
        text: 'Elles peuvent être incomplètes, imprécises, obsolètes ou variables selon le métier, la ville, la région, l’unité de facturation, la période ou le nombre de données disponibles.',
      },
      {
        type: 'paragraph',
        text: 'Ces données ne constituent pas une étude de marché officielle. Elles ne garantissent pas le prix réel du marché.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur doit effectuer ses propres vérifications avant toute décision commerciale.',
      },
    ],
  },
  {
    title: '12. Devis générés',
    content: [
      {
        type: 'paragraph',
        text: 'Tarifly permet de générer des devis PDF à partir des informations renseignées par l’utilisateur.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur est responsable des informations présentes sur ses devis : identité de l’entreprise, client, prestations, prix, taxes, conditions de paiement, délais, numéro de devis et mentions utiles.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur doit vérifier chaque devis avant de l’envoyer à son client.',
      },
      {
        type: 'paragraph',
        text: 'Tarifly ne garantit pas que les devis générés respectent toutes les obligations propres à chaque métier, secteur d’activité, statut juridique ou régime fiscal.',
      },
    ],
  },
  {
    title: '13. Signature et acceptation du devis par le client final',
    content: [
      {
        type: 'paragraph',
        text: 'Tarifly peut permettre à l’utilisateur d’envoyer un lien public à son client final afin que celui-ci consulte, télécharge, signe, accepte ou refuse un devis.',
      },
      {
        type: 'paragraph',
        text: 'Le client final n’a pas besoin de créer un compte Tarifly pour utiliser ce lien.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur reste responsable de la validité commerciale, contractuelle et juridique du devis transmis à son client final.',
      },
      {
        type: 'paragraph',
        text: 'Tarifly fournit un outil technique de signature et de suivi. Il ne remplace pas un conseil juridique sur la valeur probante ou la conformité du document signé.',
      },
    ],
  },
  {
    title: '14. Obligations de l’utilisateur',
    content: [
      {
        type: 'paragraph',
        text: 'L’utilisateur s’engage à utiliser Tarifly de manière loyale, conforme à la loi et respectueuse des droits des tiers.',
      },
      { type: 'paragraph', text: 'Il est notamment interdit de :' },
      {
        type: 'list',
        items: [
          'utiliser Tarifly à des fins illicites, frauduleuses ou abusives ;',
          'porter atteinte à la sécurité, à l’intégrité ou au fonctionnement du service ;',
          'tenter d’accéder aux comptes, données ou systèmes d’autres utilisateurs ;',
          'copier, extraire ou réutiliser massivement les données de marché ou la base interne de Tarifly ;',
          'transmettre des contenus illicites, trompeurs, diffamatoires ou portant atteinte aux droits de tiers ;',
          'détourner le service de son usage normal.',
        ],
      },
    ],
  },
  {
    title: '15. Données renseignées par l’utilisateur',
    content: [
      {
        type: 'paragraph',
        text: 'L’utilisateur reste responsable des informations qu’il renseigne dans Tarifly, notamment ses informations d’entreprise, informations client, opportunités, notes, calculs et devis.',
      },
      {
        type: 'paragraph',
        text: 'Il garantit disposer des droits, autorisations ou bases légales nécessaires pour renseigner ces informations dans l’application.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur s’engage à ne renseigner que les données nécessaires à son usage du service.',
      },
      {
        type: 'internalLink',
        text: 'Les règles relatives aux données personnelles et aux cookies sont détaillées dans la',
        href: '/confidentialite',
        label: 'Politique de confidentialité et cookies',
      },
    ],
  },
  {
    title: '16. Propriété intellectuelle',
    content: [
      {
        type: 'paragraph',
        text: 'Tarifly, son interface, ses fonctionnalités, ses textes, ses éléments graphiques, son logo, son code, sa structure et sa base interne sont protégés par le droit de la propriété intellectuelle.',
      },
      {
        type: 'paragraph',
        text: 'Les présentes Conditions n’accordent à l’utilisateur aucun droit de propriété sur Tarifly.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur bénéficie uniquement d’un droit d’accès personnel, non exclusif, non cessible et limité au service pendant la durée de son abonnement ou de son utilisation autorisée.',
      },
      {
        type: 'paragraph',
        text: 'Toute reproduction, modification, extraction, réutilisation, adaptation, commercialisation ou exploitation non autorisée de Tarifly est interdite.',
      },
    ],
  },
  {
    title: '17. Disponibilité du service',
    content: [
      {
        type: 'paragraph',
        text: 'L’éditeur met en œuvre des moyens raisonnables pour assurer l’accès et le bon fonctionnement de Tarifly.',
      },
      {
        type: 'paragraph',
        text: 'Le service peut toutefois être interrompu, ralenti ou indisponible en cas de maintenance, mise à jour, incident technique, panne, force majeure ou problème lié à un prestataire externe.',
      },
      {
        type: 'paragraph',
        text: 'L’éditeur ne garantit pas une disponibilité permanente, continue ou sans erreur du service.',
      },
    ],
  },
  {
    title: '18. Responsabilité',
    content: [
      { type: 'paragraph', text: 'L’éditeur ne peut pas être tenu responsable :' },
      {
        type: 'list',
        items: [
          'des décisions commerciales prises par l’utilisateur ;',
          'd’une mauvaise estimation de prix, marge ou rentabilité ;',
          'd’une erreur présente dans un devis généré ;',
          'd’un manquement fiscal, comptable, légal ou commercial de l’utilisateur ;',
          'd’une perte de chiffre d’affaires, perte de clientèle, perte de données, perte d’opportunité ou préjudice indirect ;',
          'd’une utilisation non conforme du service ;',
          'd’une indisponibilité temporaire du service ;',
          'd’un problème causé par un prestataire tiers, notamment Supabase, Vercel, Stripe ou tout autre service nécessaire au fonctionnement de Tarifly.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Lorsque la responsabilité de l’éditeur peut légalement être engagée, elle est limitée au montant payé par l’utilisateur au titre de l’abonnement Tarifly au cours des trois derniers mois précédant le fait générateur du dommage, sauf disposition légale contraire.',
      },
    ],
  },
  {
    title: '19. Support',
    content: [
      {
        type: 'paragraph',
        text: 'Pour toute question liée au service, l’utilisateur peut contacter l’éditeur par e-mail.',
      },
      { type: 'email', label: 'Contact support', email: 'aurorawebsec@gmail.com' },
      {
        type: 'paragraph',
        text: 'L’éditeur s’efforce de répondre dans un délai raisonnable, sans garantir de délai de réponse spécifique sauf engagement contraire.',
      },
    ],
  },
  {
    title: '20. Médiation de la consommation',
    content: [
      {
        type: 'paragraph',
        text: 'Lorsque l’utilisateur agit en qualité de consommateur, il peut recourir gratuitement à un médiateur de la consommation après avoir tenté de résoudre le litige directement auprès de l’éditeur.',
      },
      {
        type: 'paragraph',
        text: 'L’éditeur doit communiquer les coordonnées du médiateur de la consommation dont il relève dès lors qu’il vend le service à des consommateurs.',
      },
      {
        type: 'paragraph',
        text: 'Cette information doit être complétée avec le médiateur effectivement désigné par l’éditeur avant toute commercialisation à des consommateurs.',
      },
    ],
  },
  {
    title: '21. Modification des Conditions',
    content: [
      {
        type: 'paragraph',
        text: 'L’éditeur peut modifier les présentes Conditions pour tenir compte de l’évolution du service, de la loi, des fonctionnalités ou du modèle économique.',
      },
      {
        type: 'paragraph',
        text: 'Les utilisateurs sont informés des modifications importantes par tout moyen approprié.',
      },
      {
        type: 'paragraph',
        text: 'La poursuite de l’utilisation du service après l’entrée en vigueur des nouvelles Conditions vaut acceptation de celles-ci.',
      },
    ],
  },
  {
    title: '22. Droit applicable',
    content: [
      { type: 'paragraph', text: 'Les présentes Conditions sont soumises au droit français.' },
      {
        type: 'paragraph',
        text: 'En cas de litige, l’utilisateur est invité à contacter l’éditeur afin de rechercher une solution amiable.',
      },
      {
        type: 'paragraph',
        text: 'Lorsque l’utilisateur agit en qualité de professionnel, tout litige relatif aux présentes Conditions relève, sauf disposition légale contraire, des tribunaux compétents du ressort du siège de l’éditeur.',
      },
      {
        type: 'paragraph',
        text: 'Lorsque l’utilisateur agit en qualité de consommateur, les règles légales de compétence applicables aux consommateurs restent applicables.',
      },
    ],
  },
];

function ContentBlock({ item }: { item: ConditionContent }) {
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

export default function ConditionsPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <article className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-soft md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Cadre contractuel</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Conditions Générales d’Utilisation et de Vente
          </h1>
          <p className="mt-4 leading-7 text-slate-600">Dernière mise à jour : 05/06/2026</p>

          <div className="mt-8 divide-y divide-slate-200">
            {sections.map((section) => (
              <section key={section.title} className="py-6 first:pt-0 last:pb-0">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">{section.title}</h2>
                <div className="mt-3 space-y-3 leading-7 text-slate-600">
                  {section.content.map((item, index) => (
                    <ContentBlock key={`${section.title}-${index}`} item={item} />
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
