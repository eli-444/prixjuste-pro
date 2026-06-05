import type { Metadata } from 'next';
import { CookiePreferencesButton } from '@/components/CookiePreferencesButton';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Politique de confidentialité et cookies',
  description: 'Politique de confidentialité, données personnelles et cookies de Tarifly.',
  alternates: {
    canonical: '/confidentialite',
  },
};

type PolicyContent =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'subtitle'; text: string }
  | { type: 'email'; label: string; email: string }
  | { type: 'cookieButton' };

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
        text: 'Cette politique explique comment Tarifly collecte, utilise, conserve et protège les données personnelles de ses utilisateurs.',
      },
      {
        type: 'paragraph',
        text: 'Elle explique aussi l’utilisation des cookies et technologies similaires dans l’application.',
      },
      {
        type: 'paragraph',
        text: 'Tarifly est une application SaaS destinée aux indépendants, freelances, artisans, prestataires de services et petites entreprises.',
      },
    ],
  },
  {
    title: '2. Responsable du traitement',
    content: [
      { type: 'paragraph', text: 'Le responsable du traitement des données personnelles est :' },
      { type: 'paragraph', text: 'Aurora Web & Security, exerçant également sous le nom commercial Aurora Web & Sec.' },
      { type: 'paragraph', text: 'Forme juridique : entrepreneur individuel / micro-entrepreneur.' },
      { type: 'paragraph', text: 'Siège social : 82 rue Anatole France, 69100 Villeurbanne, France.' },
      { type: 'paragraph', text: 'SIREN : 991 249 228.' },
      { type: 'paragraph', text: 'SIRET : 991 249 228 00016.' },
      { type: 'email', label: 'Contact', email: 'aurorawebsec@gmail.com' },
      {
        type: 'paragraph',
        text: 'Aucun délégué à la protection des données n’a été désigné. Pour toute demande liée au RGPD ou aux données personnelles, vous pouvez utiliser le contact ci-dessous.',
      },
      { type: 'email', label: 'Contact RGPD', email: 'aurorawebsec@gmail.com' },
    ],
  },
  {
    title: '3. Données collectées',
    content: [
      {
        type: 'paragraph',
        text: 'Tarifly collecte uniquement les données nécessaires à son fonctionnement, à la sécurité du service, à la facturation et à l’amélioration de l’expérience utilisateur.',
      },
      { type: 'subtitle', text: 'Données de compte' },
      {
        type: 'list',
        items: [
          'adresse e-mail ;',
          'données nécessaires à l’authentification ;',
          'date de création du compte ;',
          'informations de connexion et de sécurité.',
        ],
      },
      { type: 'subtitle', text: 'Données de profil et d’entreprise' },
      {
        type: 'list',
        items: [
          'nom, prénom ou raison sociale ;',
          'type de compte ;',
          'nom d’entreprise ;',
          'SIRET ;',
          'adresse professionnelle ;',
          'adresse e-mail et téléphone professionnels ;',
          'préférences utilisateur ;',
          'logo éventuellement ajouté pour les devis.',
        ],
      },
      { type: 'subtitle', text: 'Données clients, prospects et devis' },
      {
        type: 'list',
        items: [
          'clients enregistrés dans le portefeuille ;',
          'nom, adresse, e-mail et téléphone du client renseigné ;',
          'opportunités commerciales ;',
          'statuts des démarches et devis ;',
          'numéros de devis, dates, dates limites, conditions et notes ;',
          'lignes de prestations, prix, quantités, taxes et conditions de paiement ;',
          'signature et réponse du client lorsque le lien public de devis est utilisé.',
        ],
      },
      { type: 'subtitle', text: 'Données de calcul et de marché' },
      {
        type: 'list',
        items: [
          'coûts d’achat ou de matière ;',
          'temps prévu ;',
          'tarif horaire, journalier ou forfaitaire ;',
          'frais fixes et frais de paiement ;',
          'TVA ;',
          'prix calculé, marge et niveau de rentabilité ;',
          'métier, région, ville et unité de facturation utilisés pour la comparaison marché.',
        ],
      },
      { type: 'subtitle', text: 'Données d’abonnement et de paiement' },
      {
        type: 'list',
        items: [
          'statut de l’abonnement ;',
          'historique de paiement ou de facturation disponible ;',
          'identifiants de transaction ;',
          'données nécessaires au lien avec Stripe.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Tarifly ne stocke pas les données complètes de carte bancaire. Ces données sont traitées par Stripe.',
      },
      { type: 'subtitle', text: 'Données techniques' },
      {
        type: 'list',
        items: [
          'adresse IP ;',
          'type de navigateur ;',
          'appareil utilisé ;',
          'logs techniques ;',
          'données utiles à la sécurité, au diagnostic, à la prévention des abus et au bon fonctionnement de l’application.',
        ],
      },
    ],
  },
  {
    title: '4. Pourquoi ces données sont utilisées',
    content: [
      { type: 'paragraph', text: 'Les données sont utilisées pour :' },
      {
        type: 'list',
        items: [
          'créer et gérer le compte utilisateur ;',
          'authentifier l’utilisateur et sécuriser l’accès ;',
          'fournir les fonctionnalités de Tarifly ;',
          'sauvegarder les clients, opportunités, calculs et devis ;',
          'générer des PDF, exports CSV et liens de devis ;',
          'gérer les signatures et réponses des clients aux devis ;',
          'gérer l’abonnement Premium ;',
          'traiter les paiements via Stripe ;',
          'assurer le support utilisateur ;',
          'maintenir, améliorer et sécuriser le service ;',
          'respecter les obligations légales, fiscales et comptables.',
        ],
      },
    ],
  },
  {
    title: '5. Bases légales',
    content: [
      { type: 'paragraph', text: 'Selon les cas, les traitements reposent sur :' },
      {
        type: 'list',
        items: [
          'l’exécution du contrat, pour fournir le service et gérer l’abonnement ;',
          'l’obligation légale, pour les obligations fiscales, comptables ou administratives ;',
          'l’intérêt légitime, pour sécuriser le service, prévenir les abus, maintenir l’application et assurer le support ;',
          'le consentement, pour les cookies ou traceurs non strictement nécessaires.',
        ],
      },
    ],
  },
  {
    title: '6. Destinataires des données',
    content: [
      {
        type: 'paragraph',
        text: 'Les données peuvent être accessibles uniquement aux personnes et prestataires qui en ont besoin pour faire fonctionner Tarifly.',
      },
      {
        type: 'list',
        items: [
          'l’éditeur du service ;',
          'Supabase, pour l’authentification, les profils utilisateurs et la base de données ;',
          'Vercel, pour l’hébergement, le déploiement et le nom de domaine ;',
          'Stripe, pour les paiements, abonnements et facturation ;',
          'les prestataires de support, maintenance, sécurité ou analyse technique si nécessaire ;',
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
        text: 'Certains prestataires utilisés par Tarifly, notamment Supabase, Vercel ou Stripe, peuvent être situés hors de l’Union européenne ou impliquer des transferts de données hors Union européenne.',
      },
      {
        type: 'paragraph',
        text: 'Lorsque ces transferts ont lieu, l’éditeur s’efforce de s’appuyer sur les garanties prévues par la réglementation applicable, notamment les engagements contractuels des prestataires et les clauses contractuelles types lorsque cela est nécessaire.',
      },
    ],
  },
  {
    title: '8. Durée de conservation',
    content: [
      {
        type: 'paragraph',
        text: 'Les données sont conservées pendant la durée nécessaire à leur finalité.',
      },
      {
        type: 'list',
        items: [
          'les données de compte sont conservées tant que le compte existe ;',
          'les clients, opportunités, calculs et devis sont conservés tant que le compte est actif ou jusqu’à suppression lorsque la fonctionnalité le permet ;',
          'les données liées aux paiements et factures sont conservées pendant la durée nécessaire aux obligations comptables, fiscales et légales ;',
          'les logs techniques et données de sécurité sont conservés pendant une durée limitée nécessaire à la sécurité et au diagnostic ;',
          'les préférences cookies sont conservées localement afin de mémoriser les choix de l’utilisateur.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Certaines données peuvent être conservées plus longtemps si la loi l’exige ou en cas de litige.',
      },
    ],
  },
  {
    title: '9. Droits des utilisateurs',
    content: [
      {
        type: 'paragraph',
        text: 'Conformément au RGPD et à la loi Informatique et Libertés, l’utilisateur peut exercer les droits suivants :',
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
      {
        type: 'paragraph',
        text: 'Pour exercer ces droits, l’utilisateur peut contacter l’éditeur.',
      },
      { type: 'email', label: 'Contact RGPD', email: 'aurorawebsec@gmail.com' },
      {
        type: 'paragraph',
        text: 'Une preuve d’identité peut être demandée lorsque cela est nécessaire pour vérifier l’identité du demandeur.',
      },
    ],
  },
  {
    title: '10. Sécurité',
    content: [
      {
        type: 'paragraph',
        text: 'L’éditeur met en œuvre des mesures techniques et organisationnelles raisonnables pour protéger les données personnelles.',
      },
      {
        type: 'list',
        items: [
          'authentification sécurisée ;',
          'gestion des accès ;',
          'stockage auprès de prestataires reconnus ;',
          'restrictions d’accès aux données ;',
          'surveillance des incidents techniques ;',
          'mécanismes de sauvegarde ou de résilience selon les services utilisés.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Aucun système informatique ne peut toutefois garantir une sécurité absolue.',
      },
    ],
  },
  {
    title: '11. Responsabilité de l’utilisateur',
    content: [
      {
        type: 'paragraph',
        text: 'L’utilisateur est responsable des données qu’il renseigne dans Tarifly, notamment les données relatives à ses clients, prospects, devis, opportunités et prestations.',
      },
      {
        type: 'paragraph',
        text: 'Il doit s’assurer qu’il dispose des droits ou bases légales nécessaires pour saisir ces informations dans l’application.',
      },
      {
        type: 'paragraph',
        text: 'Il s’engage à ne renseigner que les données utiles à son usage du service et à respecter ses propres obligations lorsqu’il traite les données de ses clients ou prospects.',
      },
    ],
  },
  {
    title: '12. Cookies et technologies similaires',
    content: [
      {
        type: 'paragraph',
        text: 'Tarifly utilise des cookies, du stockage local ou des technologies similaires.',
      },
      { type: 'subtitle', text: 'Cookies et stockage nécessaires' },
      {
        type: 'paragraph',
        text: 'Ces éléments sont nécessaires au fonctionnement du service. Ils permettent notamment :',
      },
      {
        type: 'list',
        items: [
          'la connexion au compte ;',
          'le maintien de la session utilisateur ;',
          'la sécurité du service ;',
          'la mémorisation des préférences indispensables ;',
          'la gestion de l’accès Premium ;',
          'la mémorisation des choix de consentement cookies.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Ces cookies ou éléments de stockage ne nécessitent pas toujours le consentement lorsqu’ils sont strictement nécessaires au service demandé.',
      },
      { type: 'subtitle', text: 'Cookies non essentiels' },
      {
        type: 'paragraph',
        text: 'Tarifly peut utiliser des cookies non essentiels uniquement si l’utilisateur les accepte.',
      },
      {
        type: 'list',
        items: [
          'mesure d’audience ;',
          'statistiques d’usage ;',
          'amélioration de l’expérience utilisateur ;',
          'suivi marketing facultatif si un outil de ce type est activé.',
        ],
      },
      {
        type: 'paragraph',
        text: 'L’utilisateur peut accepter, refuser ou personnaliser ses choix depuis le bandeau cookies.',
      },
      {
        type: 'paragraph',
        text: 'Il peut aussi rouvrir les préférences cookies à tout moment.',
      },
      { type: 'cookieButton' },
    ],
  },
  {
    title: '13. Services tiers',
    content: [
      {
        type: 'paragraph',
        text: 'Tarifly s’appuie sur des services tiers nécessaires à son fonctionnement.',
      },
      {
        type: 'list',
        items: [
          'Supabase, pour l’authentification et la base de données ;',
          'Vercel, pour l’hébergement, le déploiement et le nom de domaine ;',
          'Stripe, pour les paiements, abonnements et facturation.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Ces prestataires peuvent traiter certaines données selon leurs propres politiques de confidentialité.',
      },
    ],
  },
  {
    title: '14. Modification de la politique',
    content: [
      {
        type: 'paragraph',
        text: 'L’éditeur peut modifier cette politique pour tenir compte de l’évolution du service, de la réglementation ou des prestataires utilisés.',
      },
      {
        type: 'paragraph',
        text: 'En cas de modification importante, l’utilisateur pourra être informé par tout moyen approprié.',
      },
    ],
  },
  {
    title: '15. Contact',
    content: [
      {
        type: 'paragraph',
        text: 'Pour toute question relative à cette politique ou au traitement des données personnelles, l’utilisateur peut contacter l’éditeur.',
      },
      { type: 'email', label: 'Contact', email: 'aurorawebsec@gmail.com' },
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
        {item.label} :{' '}
        <a className="font-semibold text-brand-700 underline-offset-4 hover:underline" href={`mailto:${item.email}`}>
          {item.email}
        </a>
      </p>
    );
  }

  if (item.type === 'cookieButton') {
    return (
      <div className="pt-1">
        <CookiePreferencesButton />
      </div>
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
          <p className="mt-4 leading-7 text-slate-600">Dernière mise à jour : 05/06/2026</p>

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
