import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

type PolicyContent =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'subtitle'; text: string }
  | { type: 'email'; email: string };

type PolicySection = {
  title: string;
  content: PolicyContent[];
};

const sections: PolicySection[] = [
  {
    title: '1. Objet',
    content: [
      {
        type: 'paragraph',
        text: 'La présente politique de confidentialité a pour objet d’informer les utilisateurs de Tarifly sur la manière dont leurs données personnelles sont collectées, utilisées, conservées et protégées dans le cadre de l’utilisation du service.',
      },
      {
        type: 'paragraph',
        text: 'Tarifly est une application SaaS éditée par Aurora Web & Security, destinée aux indépendants, freelances, artisans, prestataires de services et petites entreprises.',
      },
    ],
  },
  {
    title: '2. Responsable du traitement',
    content: [
      { type: 'paragraph', text: 'Le responsable du traitement des données personnelles est :' },
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
    title: '3. Données collectées',
    content: [
      {
        type: 'paragraph',
        text: 'Dans le cadre de l’utilisation de Tarifly, l’éditeur peut collecter et traiter les catégories de données suivantes :',
      },
      { type: 'subtitle', text: 'Données de compte' },
      {
        type: 'list',
        items: [
          'adresse e-mail ;',
          'identifiants de connexion ;',
          'données nécessaires à l’authentification ;',
          'date de création du compte ;',
          'informations de connexion et de sécurité.',
        ],
      },
      { type: 'subtitle', text: 'Données de profil utilisateur' },
      {
        type: 'list',
        items: [
          'nom ou raison sociale ;',
          'informations d’entreprise ;',
          'adresse professionnelle ;',
          'SIRET ;',
          'coordonnées ;',
          'logo éventuellement ajouté par l’utilisateur ;',
          'préférences liées à l’utilisation du service.',
        ],
      },
      { type: 'subtitle', text: 'Données commerciales renseignées par l’utilisateur' },
      {
        type: 'list',
        items: [
          'opportunités commerciales ;',
          'informations client renseignées dans les opportunités ou devis ;',
          'statut, budget, échéance et notes ;',
          'lignes de prestation ;',
          'conditions de paiement ;',
          'dates, dates limites et numéros de devis.',
        ],
      },
      { type: 'subtitle', text: 'Données de calcul' },
      {
        type: 'list',
        items: [
          'achats et matières ;',
          'temps prévu ;',
          'tarif horaire ;',
          'frais fixes ;',
          'frais de paiement ;',
          'TVA ;',
          'prix de vente calculé ;',
          'marge ;',
          'niveau de rentabilité ;',
          'paramètres de comparaison de marché, notamment métier, région, ville et unité de facturation.',
        ],
      },
      { type: 'subtitle', text: 'Données d’abonnement et de facturation' },
      {
        type: 'list',
        items: [
          'statut de l’abonnement ;',
          'historique ou informations liées aux paiements ;',
          'identifiants de transaction ;',
          'informations nécessaires à la facturation ;',
          'données traitées via Stripe.',
        ],
      },
      {
        type: 'paragraph',
        text: 'L’éditeur ne stocke pas directement les données complètes de carte bancaire. Ces données sont traitées par Stripe.',
      },
      { type: 'subtitle', text: 'Données techniques' },
      {
        type: 'list',
        items: [
          'adresse IP ;',
          'type de navigateur ;',
          'appareil utilisé ;',
          'logs techniques ;',
          'données nécessaires à la sécurité, au diagnostic, à la prévention des abus et au bon fonctionnement de l’application.',
        ],
      },
    ],
  },
  {
    title: '4. Finalités des traitements',
    content: [
      { type: 'paragraph', text: 'Les données personnelles sont traitées pour les finalités suivantes :' },
      {
        type: 'list',
        items: [
          'création et gestion du compte utilisateur ;',
          'authentification et sécurisation de l’accès ;',
          'fourniture des fonctionnalités de Tarifly ;',
          'sauvegarde des opportunités, calculs et devis ;',
          'génération de PDF et exports CSV ;',
          'gestion de l’abonnement Premium ;',
          'traitement des paiements via Stripe ;',
          'gestion de la facturation ;',
          'support utilisateur ;',
          'amélioration, maintenance et sécurisation du service ;',
          'prévention des fraudes, abus et incidents de sécurité ;',
          'respect des obligations légales, fiscales et comptables.',
        ],
      },
    ],
  },
  {
    title: '5. Bases légales des traitements',
    content: [
      { type: 'paragraph', text: 'Selon les cas, les traitements reposent sur les bases légales suivantes :' },
      {
        type: 'list',
        items: [
          'exécution du contrat : pour fournir le service, gérer le compte, permettre l’accès aux fonctionnalités et gérer l’abonnement ;',
          'obligation légale : pour respecter les obligations comptables, fiscales ou administratives ;',
          'intérêt légitime : pour sécuriser le service, prévenir les abus, améliorer l’application et assurer le support ;',
          'consentement : pour les cookies ou traceurs non strictement nécessaires, ainsi que pour certaines communications facultatives si elles sont mises en place.',
        ],
      },
    ],
  },
  {
    title: '6. Destinataires des données',
    content: [
      {
        type: 'paragraph',
        text: 'Les données peuvent être accessibles, dans la limite de leurs missions respectives, aux destinataires suivants :',
      },
      {
        type: 'list',
        items: [
          'l’éditeur du service ;',
          'les prestataires techniques nécessaires au fonctionnement de Tarifly ;',
          'Supabase, pour l’authentification, les profils utilisateurs et la base de données ;',
          'Vercel, pour l’hébergement et le déploiement de l’application ;',
          'Stripe, pour les paiements, abonnements et facturation ;',
          'les éventuels prestataires de support, maintenance, sécurité ou analyse technique ;',
          'les autorités administratives ou judiciaires lorsque la loi l’exige.',
        ],
      },
      { type: 'paragraph', text: 'Les données ne sont pas vendues à des tiers.' },
    ],
  },
  {
    title: '7. Transferts hors Union européenne',
    content: [
      {
        type: 'paragraph',
        text: 'Certains prestataires techniques utilisés par Tarifly, notamment Supabase, Vercel ou Stripe, peuvent être situés hors de l’Union européenne ou impliquer des transferts de données hors Union européenne.',
      },
      {
        type: 'paragraph',
        text: 'Lorsque de tels transferts ont lieu, l’éditeur s’efforce de s’assurer qu’ils sont encadrés par des garanties appropriées, telles que des clauses contractuelles types, des mécanismes reconnus par la réglementation applicable ou les engagements contractuels des prestataires concernés.',
      },
    ],
  },
  {
    title: '8. Durée de conservation',
    content: [
      {
        type: 'paragraph',
        text: 'Les données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles sont traitées.',
      },
      { type: 'paragraph', text: 'À titre indicatif :' },
      {
        type: 'list',
        items: [
          'les données de compte sont conservées tant que le compte est actif ;',
          'les données d’opportunités, calculs et devis sont conservées tant que le compte est actif ou jusqu’à suppression par l’utilisateur lorsque la fonctionnalité est disponible ;',
          'les données liées à l’abonnement et à la facturation sont conservées pendant la durée nécessaire au respect des obligations comptables, fiscales et légales ;',
          'les logs techniques et données de sécurité sont conservés pendant une durée limitée nécessaire à la sécurité et au diagnostic ;',
          'les données liées aux cookies non essentiels sont conservées selon les durées indiquées dans l’outil de gestion du consentement, lorsque de tels cookies sont utilisés.',
        ],
      },
      { type: 'paragraph', text: 'Certaines données peuvent être conservées plus longtemps si la loi l’exige ou en cas de litige.' },
    ],
  },
  {
    title: '9. Droits des utilisateurs',
    content: [
      {
        type: 'paragraph',
        text: 'Conformément à la réglementation applicable en matière de protection des données personnelles, l’utilisateur peut exercer les droits suivants :',
      },
      {
        type: 'list',
        items: [
          'droit d’accès ;',
          'droit de rectification ;',
          'droit d’effacement ;',
          'droit à la limitation du traitement ;',
          'droit d’opposition ;',
          'droit à la portabilité ;',
          'droit de retirer son consentement lorsque le traitement repose sur le consentement ;',
          'droit d’introduire une réclamation auprès de la CNIL.',
        ],
      },
      { type: 'paragraph', text: 'Pour exercer ses droits, l’utilisateur peut contacter l’éditeur à l’adresse suivante :' },
      { type: 'email', email: 'aurorawebsec@gmail.com' },
      {
        type: 'paragraph',
        text: 'L’éditeur pourra demander une preuve d’identité lorsque cela est nécessaire afin de vérifier l’identité du demandeur.',
      },
    ],
  },
  {
    title: '10. Sécurité',
    content: [
      {
        type: 'paragraph',
        text: 'L’éditeur met en œuvre des mesures techniques et organisationnelles raisonnables afin de protéger les données personnelles contre l’accès non autorisé, la perte, l’altération, la divulgation ou la destruction.',
      },
      { type: 'paragraph', text: 'Ces mesures peuvent notamment inclure :' },
      {
        type: 'list',
        items: [
          'authentification sécurisée ;',
          'gestion des accès ;',
          'stockage auprès de prestataires reconnus ;',
          'restrictions d’accès aux données ;',
          'surveillance des incidents techniques ;',
          'sauvegardes ou mécanismes de résilience selon les services utilisés.',
        ],
      },
      { type: 'paragraph', text: 'Toutefois, aucun système informatique ne peut garantir une sécurité absolue.' },
    ],
  },
  {
    title: '11. Responsabilité de l’utilisateur sur les données saisies',
    content: [
      {
        type: 'paragraph',
        text: 'L’utilisateur est responsable des données qu’il renseigne dans Tarifly, notamment les informations relatives à ses clients, prospects, devis, opportunités et prestations.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur s’engage à ne renseigner que les données nécessaires à son usage professionnel et à respecter ses propres obligations en matière de protection des données personnelles lorsqu’il traite les données de ses clients ou prospects.',
      },
    ],
  },
  {
    title: '12. Cookies et traceurs',
    content: [
      { type: 'paragraph', text: 'Tarifly peut utiliser des cookies ou technologies similaires.' },
      { type: 'subtitle', text: 'Cookies strictement nécessaires' },
      {
        type: 'paragraph',
        text: 'Ces cookies sont nécessaires au fonctionnement du service, notamment pour :',
      },
      {
        type: 'list',
        items: [
          'permettre la connexion au compte ;',
          'maintenir la session utilisateur ;',
          'sécuriser l’accès ;',
          'mémoriser certains choix nécessaires au fonctionnement de l’application ;',
          'gérer l’abonnement ou l’accès aux fonctionnalités.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Ces cookies ne nécessitent pas nécessairement le consentement de l’utilisateur lorsqu’ils sont strictement indispensables au service demandé.',
      },
      { type: 'subtitle', text: 'Cookies non essentiels' },
      {
        type: 'paragraph',
        text: 'Tarifly peut utiliser, le cas échéant, des cookies ou traceurs non essentiels, notamment pour :',
      },
      {
        type: 'list',
        items: [
          'mesurer l’audience ;',
          'comprendre l’utilisation de l’application ;',
          'améliorer l’expérience utilisateur ;',
          'réaliser des statistiques ;',
          'effectuer du suivi marketing.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Lorsque ces cookies ne sont pas strictement nécessaires, ils sont déposés uniquement après consentement de l’utilisateur.',
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur peut accepter, refuser ou modifier ses préférences à tout moment depuis le bandeau ou l’outil de gestion des cookies mis à disposition dans l’application.',
      },
    ],
  },
  {
    title: '13. Services tiers',
    content: [
      {
        type: 'paragraph',
        text: 'Tarifly s’appuie sur des services tiers nécessaires à son fonctionnement, notamment Supabase, Vercel et Stripe.',
      },
      {
        type: 'paragraph',
        text: 'Ces prestataires peuvent collecter ou traiter certaines données conformément à leurs propres politiques de confidentialité. L’utilisateur est invité à consulter les politiques de confidentialité de ces prestataires pour plus d’informations.',
      },
    ],
  },
  {
    title: '14. Modification de la politique de confidentialité',
    content: [
      {
        type: 'paragraph',
        text: 'L’éditeur peut modifier la présente politique de confidentialité afin de tenir compte de l’évolution du service, de la réglementation ou des prestataires utilisés.',
      },
      { type: 'paragraph', text: 'En cas de modification importante, l’utilisateur pourra être informé par tout moyen approprié.' },
    ],
  },
  {
    title: '15. Contact',
    content: [
      {
        type: 'paragraph',
        text: 'Pour toute question relative à la présente politique de confidentialité ou au traitement des données personnelles, l’utilisateur peut contacter l’éditeur à l’adresse suivante :',
      },
      { type: 'email', email: 'aurorawebsec@gmail.com' },
    ],
  },
];

function PolicyBlock({ item }: { item: PolicyContent }) {
  if (item.type === 'subtitle') {
    return <h3 className="pt-2 text-base font-bold text-slate-950">{item.text}</h3>;
  }

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

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <article className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-soft md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Données personnelles</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Politique de confidentialité et cookies
          </h1>
          <p className="mt-4 leading-7 text-slate-600">Dernière mise à jour : 03/06/2026</p>

          <div className="mt-8 divide-y divide-slate-200">
            {sections.map((section) => (
              <section key={section.title} className="py-6 first:pt-0 last:pb-0">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">{section.title}</h2>
                <div className="mt-3 space-y-3 leading-7 text-slate-600">
                  {section.content.map((item, index) => (
                    <PolicyBlock key={`${section.title}-${index}`} item={item} />
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
