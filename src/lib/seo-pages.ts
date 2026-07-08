export type FaqItem = {
  question: string;
  answer: string;
};

export type SeoPage = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  h1: string;
  intro: string;
  audience: string;
  painPoints: string[];
  benefits: string[];
  example: {
    title: string;
    rows: Array<{ label: string; value: string }>;
    conclusion: string;
  };
  faq: FaqItem[];
  relatedSlugs?: string[];
};

export type ProfessionSeoPage = SeoPage & {
  profession: string;
  marketUnits: string[];
};

export const baseUrl = 'https://tarifly.app';

export const intentSeoPages: SeoPage[] = [
  {
    slug: 'calcul-marge-prestation',
    title: 'Calcul marge prestation',
    metaTitle: 'Calcul marge prestation : outil simple pour fixer un prix rentable',
    description:
      'Comprendre et calculer la marge réelle d’une prestation de service avec coûts, temps, frais, TVA et prix client.',
    h1: 'Calculer la marge d’une prestation sans vendre à perte',
    intro:
      'La marge d’une prestation ne dépend pas seulement du prix affiché au client. Elle dépend aussi du temps passé, des frais fixes, des achats, des frais de paiement, de la TVA et des ajustements que vous devrez peut-être absorber.',
    audience: 'Indépendants, freelances, artisans, consultants et prestataires qui veulent chiffrer une mission avec plus de sécurité.',
    painPoints: [
      'confondre chiffre d’affaires et profit réel',
      'oublier les frais de paiement, outils, achats ou déplacements',
      'annoncer un prix trop bas parce que le temps de travail est sous-estimé',
      'ne pas savoir expliquer son prix au client',
    ],
    benefits: [
      'calculer un prix TTC lisible',
      'voir la marge réelle en euros et en pourcentage',
      'identifier les missions qui deviennent fragiles',
      'transformer le calcul en devis professionnel',
    ],
    example: {
      title: 'Exemple de lecture de marge',
      rows: [
        { label: 'Coûts matière ou achats', value: '120 €' },
        { label: 'Temps prévu', value: '6 heures' },
        { label: 'Tarif facturé', value: '65 €/h' },
        { label: 'Frais fixes intégrés', value: '35 €' },
      ],
      conclusion:
        'Tarifly met en regard le prix client, les coûts réels et la marge afin d’éviter une mission rentable en apparence mais faible en résultat net.',
    },
    faq: [
      {
        question: 'Quelle est la différence entre marge et bénéfice ?',
        answer:
          'La marge mesure ce qu’il reste après certains coûts liés à la prestation. Le bénéfice final dépend ensuite de l’ensemble des charges de l’activité.',
      },
      {
        question: 'Faut-il calculer la marge HT ou TTC ?',
        answer:
          'Les deux lectures sont utiles. Le client voit souvent un prix TTC, tandis que le pilotage économique se fait plutôt avec une lecture hors taxes et coûts réels.',
      },
      {
        question: 'Tarifly remplace-t-il un expert-comptable ?',
        answer:
          'Non. Tarifly aide à structurer un prix commercial. Pour les décisions comptables, fiscales ou juridiques, un professionnel spécialisé reste nécessaire.',
      },
    ],
    relatedSlugs: ['calcul-prix-prestation-service', 'calcul-taux-horaire-freelance'],
  },
  {
    slug: 'calcul-prix-prestation-service',
    title: 'Calcul prix prestation service',
    metaTitle: 'Calcul prix prestation de service : méthode claire pour fixer son tarif',
    description:
      'Méthode pour calculer le prix d’une prestation de service avec temps vendu, coûts réels, frais, TVA et marge.',
    h1: 'Calculer le prix d’une prestation de service avec une méthode claire',
    intro:
      'Fixer le prix d’une prestation au feeling peut fonctionner une fois, mais devient risqué quand les missions se multiplient. Une méthode claire permet de défendre son prix et de protéger sa rentabilité.',
    audience: 'Prestataires de service, freelances, agences, artisans et consultants.',
    painPoints: [
      'partir du prix du concurrent sans connaître ses propres coûts',
      'oublier que le temps vendu doit financer l’activité complète',
      'sous-estimer les retours client et imprévus',
      'produire un devis sans justification économique',
    ],
    benefits: [
      'structurer le prix à partir des coûts réels',
      'adapter la facturation à l’heure, à la journée ou au forfait',
      'obtenir une marge réelle automatiquement',
      'générer un devis client cohérent',
    ],
    example: {
      title: 'Exemple de construction de prix',
      rows: [
        { label: 'Mode de facturation', value: 'Forfait projet' },
        { label: 'Coûts directs', value: '250 €' },
        { label: 'Frais fixes', value: '80 €' },
        { label: 'Prix client envisagé', value: '950 € TTC' },
      ],
      conclusion:
        'La comparaison entre coût complet, prix client et marge réelle permet de voir si le prix est solide avant l’envoi du devis.',
    },
    faq: [
      {
        question: 'Comment fixer un prix de prestation ?',
        answer:
          'Commencez par vos coûts, votre temps, vos frais fixes et le niveau de rentabilité attendu. Comparez ensuite votre prix à une fourchette de marché indicative.',
      },
      {
        question: 'Est-ce mieux de facturer à l’heure ou au forfait ?',
        answer:
          'L’heure est utile quand le temps est incertain. Le forfait est plus lisible pour le client si le périmètre de la mission est clair.',
      },
      {
        question: 'Pourquoi comparer son prix au marché ?',
        answer:
          'La comparaison aide à repérer un prix très éloigné des pratiques observées, mais elle ne remplace pas votre calcul de rentabilité.',
      },
    ],
    relatedSlugs: ['calcul-marge-prestation', 'logiciel-devis-freelance'],
  },
  {
    slug: 'calcul-taux-horaire-freelance',
    title: 'Calcul taux horaire freelance',
    metaTitle: 'Calcul taux horaire freelance : trouver un tarif rentable',
    description:
      'Calculer un taux horaire freelance cohérent avec ses charges, son temps disponible, ses frais et ses objectifs de revenu.',
    h1: 'Calculer un taux horaire freelance vraiment rentable',
    intro:
      'Un taux horaire ne doit pas seulement rémunérer l’heure passée sur une mission. Il doit aussi financer la prospection, l’administratif, les outils, les périodes creuses et les charges.',
    audience: 'Freelances, consultants indépendants, développeurs, designers, rédacteurs et prestataires digitaux.',
    painPoints: [
      'confondre salaire visé et chiffre d’affaires à facturer',
      'oublier les jours non facturés',
      'reprendre un tarif vu en ligne sans l’adapter à son activité',
      'ne pas savoir passer de l’heure au forfait',
    ],
    benefits: [
      'calculer un tarif facturé à l’heure ou à la journée',
      'visualiser la marge réelle par mission',
      'préparer un devis plus crédible',
      'repérer les missions trop peu rentables',
    ],
    example: {
      title: 'Exemple de taux horaire',
      rows: [
        { label: 'Temps prévu', value: '10 heures' },
        { label: 'Tarif horaire facturé', value: '55 €/h' },
        { label: 'Frais liés au projet', value: '70 €' },
        { label: 'Prix client', value: '550 € HT avant taxes' },
      ],
      conclusion:
        'Tarifly permet de relier le taux horaire au résultat réel de la mission, au lieu de regarder uniquement le chiffre facturé.',
    },
    faq: [
      {
        question: 'Un freelance doit-il facturer toutes ses heures ?',
        answer:
          'Non. Le tarif facturé doit aussi couvrir les heures non vendues : prospection, gestion, formation, facturation et suivi client.',
      },
      {
        question: 'Comment transformer un taux horaire en forfait ?',
        answer:
          'Estimez le temps nécessaire, ajoutez les coûts et une marge de sécurité, puis vérifiez que le forfait reste cohérent avec le marché.',
      },
      {
        question: 'Tarifly est-il adapté aux freelances ?',
        answer:
          'Oui. Tarifly aide à chiffrer une mission, produire un devis et suivre la réponse client sans construire un tableur complet.',
      },
    ],
    relatedSlugs: ['logiciel-devis-freelance', 'calcul-prix-prestation-service'],
  },
  {
    slug: 'logiciel-devis-artisan',
    title: 'Logiciel devis artisan',
    metaTitle: 'Logiciel devis artisan : prix, marge, devis et suivi client',
    description:
      'Un logiciel de devis pour artisan doit aider à calculer un prix rentable, générer un devis propre et suivre les réponses client.',
    h1: 'Un logiciel de devis pensé pour les artisans qui veulent protéger leur marge',
    intro:
      'Un devis d’artisan doit être lisible pour le client, mais aussi rentable pour l’entreprise. Tarifly relie le calcul du prix, la marge, la comparaison marché et le suivi commercial.',
    audience: 'Artisans du bâtiment, services à domicile, indépendants terrain et petites entreprises.',
    painPoints: [
      'devoir refaire les mêmes calculs à chaque demande',
      'perdre du temps entre prix, devis PDF et suivi client',
      'accepter des chantiers mal chiffrés',
      'ne pas savoir si son prix est cohérent avec la zone',
    ],
    benefits: [
      'calculer un prix avant de rédiger le devis',
      'générer un devis PDF professionnel',
      'envoyer un lien client signable',
      'suivre accepté, refusé ou en attente',
    ],
    example: {
      title: 'Exemple artisan',
      rows: [
        { label: 'Type de mission', value: 'Intervention ou chantier court' },
        { label: 'Coûts directs', value: 'Matériel, déplacement, frais fixes' },
        { label: 'Comparaison', value: 'Métier + région + ville' },
        { label: 'Sortie', value: 'Devis PDF et lien client' },
      ],
      conclusion:
        'L’objectif est de réduire les devis faits au hasard et de garder une trace commerciale exploitable.',
    },
    faq: [
      {
        question: 'Tarifly remplace-t-il un logiciel de facturation ?',
        answer:
          'Non. Tarifly se concentre sur le chiffrage, le devis et le suivi commercial. La facturation comptable peut rester dans votre outil habituel.',
      },
      {
        question: 'Un client peut-il signer le devis en ligne ?',
        answer:
          'Oui. Le devis peut être partagé par lien, consulté, téléchargé, signé, accepté ou refusé sans compte client.',
      },
      {
        question: 'Les prix de marché sont-ils officiels ?',
        answer:
          'Non. Ce sont des repères indicatifs pour situer un prix. Votre rentabilité réelle reste prioritaire.',
      },
    ],
    relatedSlugs: ['logiciel-devis-auto-entrepreneur', 'calcul-marge-prestation'],
  },
  {
    slug: 'logiciel-devis-freelance',
    title: 'Logiciel devis freelance',
    metaTitle: 'Logiciel devis freelance : calcul de prix, marge et devis pro',
    description:
      'Tarifly aide les freelances à calculer un prix, vérifier leur marge, générer un devis et suivre les réponses client.',
    h1: 'Un logiciel de devis pour freelances qui veulent arrêter de chiffrer au hasard',
    intro:
      'Le freelance vend souvent du temps, de l’expertise et de la valeur. Tarifly aide à traduire ces éléments en prix clair, marge lisible et devis présentable.',
    audience: 'Freelances web, consultants, designers, rédacteurs, développeurs, formateurs et créatifs.',
    painPoints: [
      'devoir justifier un prix face au client',
      'passer trop de temps sur des devis qui ne signent pas',
      'ne pas savoir si un forfait couvre réellement le temps prévu',
      'oublier les frais cachés',
    ],
    benefits: [
      'passer rapidement d’un calcul à un devis',
      'comparer taux horaire, journée ou forfait',
      'suivre les devis envoyés',
      'voir les statistiques commerciales',
    ],
    example: {
      title: 'Exemple freelance',
      rows: [
        { label: 'Mission', value: 'Site vitrine ou prestation conseil' },
        { label: 'Facturation', value: 'Heure, journée ou forfait' },
        { label: 'Contrôle', value: 'Marge réelle + marché' },
        { label: 'Livrable', value: 'Devis signé en ligne' },
      ],
      conclusion:
        'Tarifly donne une base rationnelle au prix avant de l’envoyer au client.',
    },
    faq: [
      {
        question: 'Tarifly convient-il aux missions au forfait ?',
        answer:
          'Oui. Vous pouvez renseigner un montant global et vérifier la marge réelle en fonction des coûts et du temps estimé.',
      },
      {
        question: 'Puis-je sauvegarder mes devis ?',
        answer:
          'Oui. Les opportunités et devis peuvent être retrouvés dans le dashboard.',
      },
      {
        question: 'Le client doit-il créer un compte ?',
        answer:
          'Non. Le lien client permet de consulter et signer le devis sans inscription.',
      },
    ],
    relatedSlugs: ['calcul-taux-horaire-freelance', 'devis-auto-entrepreneur'],
  },
  {
    slug: 'devis-auto-entrepreneur',
    title: 'Devis auto-entrepreneur',
    metaTitle: 'Devis auto-entrepreneur : calculer son prix et générer un devis',
    description:
      'Créer un devis auto-entrepreneur plus solide avec calcul de prix, marge, TVA éventuelle, lien client et suivi.',
    h1: 'Créer un devis auto-entrepreneur avec un prix mieux construit',
    intro:
      'Un auto-entrepreneur doit souvent aller vite, mais un devis rapide ne doit pas être un devis fragile. Tarifly aide à relier prix, coûts et suivi client.',
    audience: 'Auto-entrepreneurs, micro-entreprises, prestataires de service et artisans indépendants.',
    painPoints: [
      'reprendre un modèle de devis sans calculer la rentabilité',
      'oublier les frais de plateforme ou d’achat',
      'ne pas suivre les devis refusés ou acceptés',
      'manquer de crédibilité dans la présentation',
    ],
    benefits: [
      'préparer un devis propre',
      'suivre la réponse client',
      'éviter les erreurs de prix',
      'conserver un historique commercial',
    ],
    example: {
      title: 'Exemple auto-entrepreneur',
      rows: [
        { label: 'Prix vendu', value: 'Montant TTC annoncé au client' },
        { label: 'Coûts', value: 'Achats, temps, frais fixes' },
        { label: 'Analyse', value: 'Marge réelle' },
        { label: 'Suivi', value: 'Accepté, refusé ou en attente' },
      ],
      conclusion:
        'Le devis devient un outil commercial suivi, pas seulement un document PDF isolé.',
    },
    faq: [
      {
        question: 'Un auto-entrepreneur doit-il indiquer un SIRET ?',
        answer:
          'Oui. Le SIRET fait partie des informations professionnelles importantes à renseigner correctement sur ses documents.',
      },
      {
        question: 'Tarifly gère-t-il la TVA ?',
        answer:
          'Tarifly permet de renseigner un taux de TVA ou 0 si vous n’êtes pas concerné. La vérification fiscale reste sous votre responsabilité.',
      },
      {
        question: 'Puis-je envoyer le devis par lien ?',
        answer:
          'Oui. Le devis peut être partagé avec un client qui pourra le consulter et répondre sans compte Tarifly.',
      },
    ],
    relatedSlugs: ['logiciel-devis-freelance', 'logiciel-devis-artisan'],
  },
  {
    slug: 'logiciel-suivi-devis',
    title: 'Logiciel suivi devis',
    metaTitle: 'Logiciel suivi devis : suivre acceptations, refus et opportunités',
    description:
      'Suivre ses devis envoyés, les réponses clients, les opportunités et les performances commerciales dans un dashboard.',
    h1: 'Suivre ses devis pour mieux piloter son activité commerciale',
    intro:
      'Un devis oublié est souvent une opportunité perdue. Tarifly permet de suivre les devis envoyés, les réponses client et les performances commerciales.',
    audience: 'Indépendants, artisans, freelances et TPE qui veulent mieux suivre leur pipeline commercial.',
    painPoints: [
      'ne plus savoir quel devis relancer',
      'mélanger prospects, clients et opportunités',
      'perdre l’historique des refus',
      'ne pas mesurer son taux d’acceptation',
    ],
    benefits: [
      'voir les devis en attente',
      'suivre les acceptations et refus',
      'analyser son portefeuille client',
      'améliorer ses prochains prix',
    ],
    example: {
      title: 'Exemple de suivi',
      rows: [
        { label: 'Devis envoyé', value: 'En attente client' },
        { label: 'Réponse', value: 'Accepté ou refusé via le lien' },
        { label: 'Dashboard', value: 'Statistiques et portefeuille' },
        { label: 'Décision', value: 'Relancer ou ajuster la stratégie' },
      ],
      conclusion:
        'Le suivi transforme les devis en données commerciales exploitables.',
    },
    faq: [
      {
        question: 'Pourquoi suivre ses devis ?',
        answer:
          'Le suivi permet de comprendre ce qui signe, ce qui bloque et quels clients ou prestations génèrent le plus de valeur.',
      },
      {
        question: 'Le statut du devis est-il manuel ?',
        answer:
          'Le statut peut évoluer avec la réponse du client via le lien public.',
      },
      {
        question: 'Tarifly envoie-t-il une notification ?',
        answer:
          'Oui. L’application peut notifier l’utilisateur lorsqu’un client accepte ou refuse un devis.',
      },
    ],
    relatedSlugs: ['logiciel-devis-freelance', 'logiciel-devis-artisan'],
  },
];

export const professionSeoPages: ProfessionSeoPage[] = [
  buildProfessionPage('plombier', 'Plombier', ['heure', 'forfait', 'intervention'], 'déplacements, fournitures, urgence éventuelle et temps d’intervention'),
  buildProfessionPage('electricien', 'Électricien', ['heure', 'forfait', 'intervention'], 'temps sur site, matériel, déplacement et complexité technique'),
  buildProfessionPage('plaquiste', 'Plaquiste', ['m²', 'journée', 'forfait'], 'surface, préparation, fournitures et temps de pose'),
  buildProfessionPage('carreleur', 'Carreleur', ['m²', 'journée', 'forfait'], 'surface, préparation du support, découpe, colle, joints et déplacement'),
  buildProfessionPage('peintre', 'Peintre', ['m²', 'journée', 'forfait'], 'surface, nombre de couches, préparation, peinture et temps de finition'),
  buildProfessionPage('bricoleur', 'Bricoleur à domicile', ['heure', 'intervention'], 'temps d’intervention, déplacement, petites fournitures et frais fixes'),
  buildProfessionPage('jardinier', 'Jardinier paysagiste', ['heure', 'journée', 'forfait'], 'temps terrain, matériel, déchets verts, déplacement et saisonnalité'),
  buildProfessionPage('menuisier', 'Menuisier', ['heure', 'forfait', 'm²'], 'matières, temps d’atelier, pose, déplacement et finition'),
  buildProfessionPage('webdesigner', 'Webdesigner', ['jour', 'forfait', 'heure'], 'temps de conception, échanges client, maquettes, retours et outils'),
  buildProfessionPage('graphiste', 'Graphiste', ['forfait', 'jour', 'heure'], 'création, droits d’usage, retours client, déclinaisons et préparation des fichiers'),
  buildProfessionPage('developpeur-web', 'Développeur web', ['jour', 'forfait', 'heure'], 'complexité technique, développement, tests, corrections et maintenance'),
  buildProfessionPage('consultant', 'Consultant', ['jour', 'heure', 'forfait'], 'expertise, préparation, restitution, suivi et valeur créée pour le client'),
  buildProfessionPage('community-manager', 'Community manager', ['mois', 'forfait', 'jour'], 'volume de contenus, animation, reporting, outils et fréquence de publication'),
  buildProfessionPage('redacteur-web', 'Rédacteur web', ['mot', 'article', 'forfait'], 'recherche, rédaction, optimisation SEO, relecture et niveau d’expertise'),
  buildProfessionPage('photographe', 'Photographe', ['prestation', 'heure', 'journée'], 'préparation, prise de vue, déplacement, sélection, retouche et livraison'),
  buildProfessionPage('coach', 'Coach professionnel', ['séance', 'heure', 'forfait'], 'préparation, accompagnement, suivi, supports et positionnement'),
  buildProfessionPage('formateur', 'Formateur', ['jour', 'heure', 'forfait'], 'préparation pédagogique, animation, supports, déplacements et adaptation client'),
  buildProfessionPage('detailing-auto', 'Detailing auto', ['prestation', 'heure', 'forfait'], 'temps de préparation, produits, niveau de finition et immobilisation du véhicule'),
];

export function getIntentSeoPage(slug: string) {
  return intentSeoPages.find((page) => page.slug === slug);
}

export function getProfessionSeoPage(slug: string) {
  return professionSeoPages.find((page) => page.slug === slug);
}

function buildProfessionPage(slug: string, profession: string, marketUnits: string[], costFactors: string): ProfessionSeoPage {
  return {
    slug,
    profession,
    marketUnits,
    title: `Prix et devis ${profession}`,
    metaTitle: `${profession} : calculer un prix rentable et générer un devis`,
    description: `Calculer un prix de ${profession}, comparer son tarif au marché et générer un devis professionnel avec Tarifly.`,
    h1: `Calculer un prix de ${profession} et préparer un devis professionnel`,
    intro: `Pour un ${profession}, un bon prix doit couvrir les coûts, le temps réel, les frais fixes et les imprévus, tout en restant compréhensible pour le client. Tarifly aide à structurer ce calcul avant l’envoi du devis.`,
    audience: `${profession}s indépendants, auto-entrepreneurs, petites entreprises et prestataires qui veulent mieux chiffrer leurs missions.`,
    painPoints: [
      'annoncer un prix trop vite sans mesurer la marge',
      `oublier certains éléments comme ${costFactors}`,
      'ne pas savoir si le tarif paraît cohérent dans la zone',
      'perdre le suivi après l’envoi du devis',
    ],
    benefits: [
      'calculer un prix à partir des coûts réels',
      `comparer le tarif selon des unités utiles : ${marketUnits.join(', ')}`,
      'générer un devis PDF professionnel',
      'suivre la réponse client depuis le dashboard',
    ],
    example: {
      title: `Exemple de chiffrage ${profession}`,
      rows: [
        { label: 'Métier', value: profession },
        { label: 'Unités utiles', value: marketUnits.join(', ') },
        { label: 'Éléments à intégrer', value: costFactors },
        { label: 'Sortie Tarifly', value: 'Prix, marge, benchmark et devis' },
      ],
      conclusion:
        'Le calcul reste indicatif, mais il donne une base claire pour éviter un devis trop bas ou difficile à défendre.',
    },
    faq: [
      {
        question: `Comment calculer le prix d’un ${profession} ?`,
        answer:
          'Il faut partir des coûts réels, du temps prévu, des frais fixes, des taxes éventuelles et du niveau de rentabilité souhaité, puis comparer le résultat à une fourchette de marché indicative.',
      },
      {
        question: `Tarifly peut-il comparer un tarif de ${profession} au marché ?`,
        answer:
          'Oui, lorsque les données sont disponibles pour le métier, la région, la ville et l’unité de facturation sélectionnées.',
      },
      {
        question: `Le devis généré est-il destiné au client ?`,
        answer:
          'Oui. Le devis PDF reprend les informations utiles au client, avec possibilité de lien public, téléchargement, signature et réponse.',
      },
    ],
    relatedSlugs: ['calcul-marge-prestation', 'logiciel-devis-artisan'],
  };
}
