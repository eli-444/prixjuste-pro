import type { Metadata } from 'next';
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
  | { type: 'email'; email: string };

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
        text: 'Les présentes Conditions Générales d’Utilisation et de Vente, ci-après les « Conditions », ont pour objet de définir les conditions d’accès, d’utilisation, de souscription et de paiement du service Tarifly.',
      },
      {
        type: 'paragraph',
        text: 'Tarifly est une application SaaS éditée par Aurora Web & Security, permettant notamment aux indépendants, freelances, artisans, prestataires de services et petites entreprises de structurer leurs coûts, calculer des prix de vente, comparer des prix à des données indicatives de marché, gérer des opportunités commerciales et générer des devis professionnels.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisation du service implique l’acceptation pleine et entière des présentes Conditions.',
      },
    ],
  },
  {
    title: '2. Éditeur',
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
      { type: 'email', email: 'aurorawebsec@gmail.com' },
    ],
  },
  {
    title: '3. Définitions',
    content: [
      { type: 'paragraph', text: 'Dans les présentes Conditions, les termes suivants désignent :' },
      {
        type: 'list',
        items: [
          'Service : l’application Tarifly et l’ensemble de ses fonctionnalités.',
          'Utilisateur : toute personne utilisant Tarifly, avec ou sans compte.',
          'Client : tout utilisateur ayant souscrit à une offre payante.',
          'Compte : espace personnel créé par l’utilisateur pour accéder au service.',
          'Abonnement Premium : formule payante donnant accès à des fonctionnalités avancées ou illimitées.',
          'Données utilisateur : informations renseignées par l’utilisateur dans Tarifly, notamment données d’entreprise, opportunités commerciales, données de calcul, informations client, devis et notes.',
          'Données de marché : estimations indicatives affichées dans Tarifly à partir d’une base interne ou de données agrégées.',
        ],
      },
    ],
  },
  {
    title: '4. Accès au service',
    content: [
      {
        type: 'paragraph',
        text: 'L’accès à certaines fonctionnalités de Tarifly nécessite la création d’un compte utilisateur.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur s’engage à fournir des informations exactes, complètes et à jour lors de la création de son compte et de l’utilisation du service.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute utilisation de son compte est réputée effectuée par lui, sauf preuve contraire.',
      },
      {
        type: 'paragraph',
        text: 'En cas d’utilisation frauduleuse, suspecte ou non autorisée de son compte, l’utilisateur doit contacter l’éditeur dans les meilleurs délais à l’adresse suivante :',
      },
      { type: 'email', email: 'aurorawebsec@gmail.com' },
    ],
  },
  {
    title: '5. Fonctionnalités du service',
    content: [
      { type: 'paragraph', text: 'Tarifly permet notamment à l’utilisateur de :' },
      {
        type: 'list',
        items: [
          'créer un compte utilisateur ;',
          'renseigner ses informations d’entreprise ;',
          'créer et gérer des opportunités commerciales ;',
          'saisir les coûts réels d’une mission ;',
          'calculer automatiquement un prix de vente TTC, une marge et un niveau de rentabilité ;',
          'comparer le prix calculé à des données indicatives de marché ;',
          'sauvegarder des opportunités et calculs ;',
          'générer un résumé PDF interne ;',
          'générer un devis PDF destiné au client ;',
          'exporter certaines données en CSV ;',
          'accéder à un dashboard ;',
          'gérer son compte et son abonnement premium.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Certaines fonctionnalités peuvent être limitées, réservées à l’offre Premium ou accessibles gratuitement une seule fois avant souscription.',
      },
    ],
  },
  {
    title: '6. Nature indicative des calculs',
    content: [
      {
        type: 'paragraph',
        text: 'Les calculs, marges, prix recommandés, comparaisons de marché, indicateurs de rentabilité et autres résultats fournis par Tarifly sont donnés à titre strictement indicatif.',
      },
      {
        type: 'paragraph',
        text: 'Tarifly n’est pas un cabinet comptable, un expert-comptable, un conseiller juridique, un conseiller fiscal, un conseiller financier ou un conseiller commercial personnalisé.',
      },
      { type: 'paragraph', text: 'L’utilisateur reste seul responsable :' },
      {
        type: 'list',
        items: [
          'du choix de ses prix ;',
          'de la vérification des calculs ;',
          'de la rentabilité réelle de ses prestations ;',
          'de la conformité de ses devis ;',
          'de ses obligations fiscales, comptables, sociales, légales et commerciales ;',
          'de toute décision prise à partir des informations fournies par Tarifly.',
        ],
      },
      {
        type: 'paragraph',
        text: 'L’éditeur ne garantit pas que les prix suggérés ou calculés permettront à l’utilisateur d’obtenir une rentabilité, un chiffre d’affaires, une marge ou un résultat commercial déterminé.',
      },
    ],
  },
  {
    title: '7. Données de marché',
    content: [
      {
        type: 'paragraph',
        text: 'Les données de marché affichées dans Tarifly sont des estimations issues d’une base de données interne, de données agrégées ou de données indicatives.',
      },
      {
        type: 'paragraph',
        text: 'Elles peuvent être incomplètes, imprécises, obsolètes ou variables selon les régions, villes, métiers, périodes, unités de facturation ou méthodes de calcul.',
      },
      {
        type: 'paragraph',
        text: 'Ces données ne constituent pas une étude de marché officielle, exhaustive ou opposable. Elles ne garantissent pas le prix réel du marché.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur reconnaît que les données de marché servent uniquement d’aide à la réflexion et qu’il doit effectuer ses propres vérifications avant toute décision commerciale.',
      },
    ],
  },
  {
    title: '8. Devis générés',
    content: [
      {
        type: 'paragraph',
        text: 'Tarifly permet de générer des devis PDF à partir des informations renseignées par l’utilisateur.',
      },
      { type: 'paragraph', text: 'L’utilisateur est seul responsable :' },
      {
        type: 'list',
        items: [
          'des informations d’entreprise renseignées ;',
          'des informations client renseignées ;',
          'des prestations décrites ;',
          'des prix, taxes, remises, conditions de paiement et délais affichés ;',
          'du numéro de devis ;',
          'de la conformité du devis à sa situation légale, fiscale et commerciale ;',
          'de la vérification du devis avant tout envoi au client.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Tarifly ne garantit pas que les devis générés respectent toutes les obligations spécifiques applicables à chaque métier, secteur, statut juridique ou situation fiscale.',
      },
    ],
  },
  {
    title: '9. Abonnement Premium',
    content: [
      { type: 'paragraph', text: 'Tarifly est proposé sous forme d’abonnement mensuel Premium.' },
      {
        type: 'paragraph',
        text: 'L’abonnement permet d’accéder à certaines fonctionnalités avancées, notamment selon l’offre disponible au moment de la souscription.',
      },
      {
        type: 'paragraph',
        text: 'Le prix de l’abonnement Tarifly Premium est fixé à 9,90 EUR TTC par mois. Ce prix est indiqué sur l’application avant toute souscription. Le prix peut être modifié à tout moment pour les nouvelles souscriptions. En cas de modification applicable à un abonnement existant, l’utilisateur en sera informé dans un délai raisonnable avant son entrée en vigueur.',
      },
      {
        type: 'paragraph',
        text: 'Sauf mention contraire, l’abonnement est renouvelé automatiquement chaque mois jusqu’à sa résiliation par l’utilisateur.',
      },
    ],
  },
  {
    title: '10. Paiement',
    content: [
      { type: 'paragraph', text: 'Les paiements sont traités par Stripe, prestataire de paiement tiers.' },
      {
        type: 'paragraph',
        text: 'L’éditeur ne stocke pas directement les données complètes de carte bancaire de l’utilisateur. Les données de paiement sont traitées par Stripe conformément à ses propres conditions et politiques de confidentialité.',
      },
      {
        type: 'paragraph',
        text: 'En souscrivant à une offre payante, l’utilisateur autorise le prélèvement du montant de l’abonnement selon la périodicité indiquée lors de la souscription.',
      },
      {
        type: 'paragraph',
        text: 'En cas d’échec de paiement, d’expiration du moyen de paiement ou d’incident de facturation, l’accès aux fonctionnalités Premium pourra être suspendu ou limité jusqu’à régularisation.',
      },
    ],
  },
  {
    title: '11. Résiliation',
    content: [
      {
        type: 'paragraph',
        text: 'L’utilisateur peut résilier son abonnement Premium depuis son espace compte, son portail de facturation ou tout autre moyen mis à disposition dans l’application.',
      },
      {
        type: 'paragraph',
        text: 'Sauf mention contraire ou obligation légale contraire, la résiliation prend effet à la fin de la période d’abonnement en cours. La période déjà payée reste accessible jusqu’à son échéance et n’est pas remboursée au prorata.',
      },
      {
        type: 'paragraph',
        text: 'L’éditeur peut suspendre ou résilier l’accès au service en cas de violation des présentes Conditions, d’usage frauduleux, de tentative d’atteinte à la sécurité du service, d’impayé ou d’utilisation abusive.',
      },
    ],
  },
  {
    title: '12. Droit de rétractation',
    content: [
      {
        type: 'paragraph',
        text: 'Lorsque l’utilisateur agit en qualité de consommateur et que le droit de rétractation est applicable, il dispose en principe d’un délai de quatorze jours pour exercer ce droit.',
      },
      {
        type: 'paragraph',
        text: 'Toutefois, lorsque l’utilisateur demande l’accès immédiat au service numérique avant la fin du délai de rétractation, il peut lui être demandé de reconnaître qu’il renonce à son droit de rétractation pour la période ou le service déjà exécuté, lorsque la loi le permet.',
      },
      {
        type: 'paragraph',
        text: 'Lorsque l’utilisateur agit exclusivement dans le cadre de son activité professionnelle, les règles relatives au droit de rétractation des consommateurs ne s’appliquent pas, sauf disposition légale contraire.',
      },
    ],
  },
  {
    title: '13. Obligations de l’utilisateur',
    content: [
      {
        type: 'paragraph',
        text: 'L’utilisateur s’engage à utiliser Tarifly conformément aux présentes Conditions, à la loi applicable et aux droits des tiers.',
      },
      { type: 'paragraph', text: 'Il s’interdit notamment de :' },
      {
        type: 'list',
        items: [
          'utiliser Tarifly à des fins illicites, frauduleuses ou abusives ;',
          'porter atteinte à la sécurité, à l’intégrité ou au fonctionnement du service ;',
          'tenter d’accéder aux comptes, données ou systèmes d’autres utilisateurs ;',
          'copier, extraire ou réutiliser massivement les données de marché ou la base interne de Tarifly ;',
          'détourner le service de sa finalité ;',
          'transmettre des contenus illicites, trompeurs, diffamatoires ou portant atteinte aux droits de tiers.',
        ],
      },
    ],
  },
  {
    title: '14. Contenus et données renseignés par l’utilisateur',
    content: [
      {
        type: 'paragraph',
        text: 'L’utilisateur conserve la responsabilité des contenus qu’il renseigne dans Tarifly, notamment ses informations d’entreprise, informations client, notes, opportunités commerciales, lignes de devis et données de calcul.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur garantit qu’il dispose des droits, autorisations ou bases légales nécessaires pour renseigner ces informations dans l’application.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur s’engage à ne pas renseigner de données sensibles ou inutiles au fonctionnement du service, notamment des données relatives à la santé, aux opinions politiques, aux convictions religieuses, à l’origine ethnique, à la vie sexuelle ou à des infractions, sauf nécessité légale et sous sa seule responsabilité.',
      },
    ],
  },
  {
    title: '15. Propriété intellectuelle',
    content: [
      {
        type: 'paragraph',
        text: 'Le service Tarifly, son interface, ses fonctionnalités, sa structure, son code, ses textes, ses éléments graphiques, son logo, sa base interne et ses contenus sont protégés par le droit de la propriété intellectuelle.',
      },
      {
        type: 'paragraph',
        text: 'Les présentes Conditions n’accordent à l’utilisateur aucun droit de propriété sur Tarifly. L’utilisateur bénéficie uniquement d’un droit d’accès personnel, non exclusif, non cessible et limité au service, pendant la durée de son utilisation ou de son abonnement.',
      },
      {
        type: 'paragraph',
        text: 'Toute reproduction, modification, extraction, réutilisation, adaptation, commercialisation ou exploitation non autorisée de Tarifly est interdite.',
      },
    ],
  },
  {
    title: '16. Disponibilité du service',
    content: [
      { type: 'paragraph', text: 'L’éditeur met en œuvre des efforts raisonnables pour assurer l’accès au service.' },
      {
        type: 'paragraph',
        text: 'Toutefois, Tarifly peut être temporairement indisponible en raison d’opérations de maintenance, mises à jour, incidents techniques, pannes, interruptions de services tiers, problèmes d’hébergement, force majeure ou événements indépendants de la volonté de l’éditeur.',
      },
      { type: 'paragraph', text: 'L’éditeur ne garantit pas une disponibilité permanente, continue ou sans erreur du service.' },
    ],
  },
  {
    title: '17. Responsabilité',
    content: [
      { type: 'paragraph', text: 'L’éditeur ne saurait être tenu responsable :' },
      {
        type: 'list',
        items: [
          'des décisions commerciales prises par l’utilisateur ;',
          'd’une mauvaise estimation de prix, marge ou rentabilité ;',
          'd’une erreur dans un devis généré ;',
          'd’un manquement fiscal, comptable, légal ou commercial de l’utilisateur ;',
          'd’une perte de chiffre d’affaires, perte de clientèle, perte de données, perte d’opportunité ou préjudice indirect ;',
          'd’une utilisation non conforme du service ;',
          'd’une indisponibilité temporaire du service ;',
          'd’un problème causé par un prestataire tiers, notamment Supabase, Vercel ou Stripe.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Dans tous les cas, lorsque la responsabilité de l’éditeur peut légalement être engagée, elle est limitée au montant payé par l’utilisateur au titre de l’abonnement Tarifly au cours des trois derniers mois précédant le fait générateur du dommage, sauf disposition légale contraire.',
      },
    ],
  },
  {
    title: '18. Support',
    content: [
      { type: 'paragraph', text: 'Pour toute demande relative au service, l’utilisateur peut contacter l’éditeur à l’adresse suivante :' },
      { type: 'email', email: 'aurorawebsec@gmail.com' },
      {
        type: 'paragraph',
        text: 'L’éditeur s’efforce de répondre dans un délai raisonnable, sans garantie de délai de réponse spécifique sauf engagement contraire.',
      },
    ],
  },
  {
    title: '19. Modification des Conditions',
    content: [
      {
        type: 'paragraph',
        text: 'L’éditeur se réserve le droit de modifier les présentes Conditions à tout moment, notamment pour tenir compte de l’évolution du service, de la loi, des fonctionnalités ou du modèle économique.',
      },
      { type: 'paragraph', text: 'Les utilisateurs seront informés des modifications importantes par tout moyen approprié.' },
      {
        type: 'paragraph',
        text: 'La poursuite de l’utilisation du service après l’entrée en vigueur des nouvelles Conditions vaut acceptation de celles-ci.',
      },
    ],
  },
  {
    title: '20. Médiation de la consommation',
    content: [
      {
        type: 'paragraph',
        text: 'Lorsque l’utilisateur agit en qualité de consommateur, il peut, après avoir tenté de résoudre préalablement le litige directement auprès de l’éditeur, recourir gratuitement à un médiateur de la consommation.',
      },
      {
        type: 'paragraph',
        text: 'Médiateur compétent : CM2C - Centre de la Médiation de la Consommation de Conciliateurs de Justice',
      },
      { type: 'paragraph', text: 'Adresse : 49 rue de Ponthieu, 75008 Paris, France' },
      { type: 'paragraph', text: 'Site internet : https://www.cm2c.net' },
      { type: 'paragraph', text: 'Saisine en ligne : https://www.cm2c.net/declarer-un-litige.php' },
      {
        type: 'paragraph',
        text: 'Cette mention doit être maintenue uniquement si l’éditeur dispose effectivement d’une convention ou adhésion active auprès du médiateur indiqué.',
      },
    ],
  },
  {
    title: '21. Droit applicable',
    content: [
      { type: 'paragraph', text: 'Les présentes Conditions sont soumises au droit français.' },
      {
        type: 'paragraph',
        text: 'En cas de litige, l’utilisateur est invité à contacter préalablement l’éditeur afin de rechercher une solution amiable.',
      },
      {
        type: 'paragraph',
        text: 'Lorsque l’utilisateur agit en qualité de professionnel, tout litige relatif à la formation, l’interprétation, l’exécution ou la cessation des présentes Conditions relève, sauf disposition légale contraire, de la compétence des tribunaux compétents du ressort du siège de l’éditeur.',
      },
      {
        type: 'paragraph',
        text: 'Lorsque l’utilisateur agit en qualité de consommateur, les règles légales de compétence juridictionnelle applicables aux consommateurs demeurent applicables.',
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
        Contact :{' '}
        <a className="font-semibold text-brand-700 underline-offset-4 hover:underline" href={`mailto:${item.email}`}>
          {item.email}
        </a>
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
          <p className="mt-4 leading-7 text-slate-600">Dernière mise à jour : 03/06/2026</p>

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
