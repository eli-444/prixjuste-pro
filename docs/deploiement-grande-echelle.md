# Tarifly - Patch de préparation au déploiement grande échelle

Dernière mise à jour : 05/06/2026

## Verdict actuel

Tarifly peut être déployé en bêta payante contrôlée.

Tarifly ne doit pas encore être lancé en grande échelle sans une phase de stabilisation, de mesure et de validation marché.

Le produit a déjà une base sérieuse :

- calcul de prix et marge ;
- comparaison marché ;
- opportunités commerciales ;
- portefeuille client ;
- devis PDF ;
- lien client public ;
- signature et acceptation/refus du devis ;
- abonnement Stripe ;
- dashboard ;
- pages légales et cookies.

Le risque principal n'est pas l'absence de fonctionnalités. Le risque principal est de lancer trop fort avant d'avoir vérifié la fiabilité du parcours complet, la qualité des données marché et la rétention réelle des premiers utilisateurs.

## Objectif du patch

Ce document sert de checklist produit, technique, juridique et commerciale avant un déploiement à grande échelle.

Il doit être utilisé avant toute communication massive, acquisition payante, campagne SEO importante ou ouverture large à des utilisateurs non accompagnés.

## Phase 1 - Bêta payante contrôlée

Objectif : vendre à de vrais utilisateurs, mais en gardant un volume maîtrisé.

Volume recommandé :

- 10 à 30 utilisateurs payants ;
- profils ciblés : freelances, artisans, prestataires de services, petites entreprises ;
- support manuel accepté ;
- correction rapide des retours.

Critères de sortie :

- les utilisateurs arrivent à créer un compte sans aide ;
- au moins 60 % des utilisateurs génèrent un premier devis dans les 7 jours ;
- le paiement Premium s'active correctement ;
- les devis PDF sont utilisables sans retouche majeure ;
- les liens clients fonctionnent ;
- la signature client est bien enregistrée ;
- les statuts acceptés/refusés remontent dans le dashboard ;
- aucun bug bloquant sur inscription, paiement, devis ou résiliation.

## Phase 2 - Pré-lancement public

Objectif : ouvrir plus largement, mais sans acquisition agressive.

Volume recommandé :

- 30 à 100 utilisateurs payants ;
- retours utilisateurs structurés ;
- premières statistiques de conversion et rétention ;
- support encore majoritairement manuel.

Critères de sortie :

- churn mensuel inférieur à 10-15 % au début ;
- au moins 60 % des utilisateurs actifs créent un calcul ou devis ;
- moins de 5 % de demandes support bloquantes ;
- parcours mobile acceptable ;
- données marché compréhensibles et cohérentes pour les métiers prioritaires ;
- pages légales finalisées ;
- process de résiliation testé ;
- facturation Stripe stable.

## Phase 3 - Grande échelle

Objectif : accepter un volume important sans dégrader l'expérience ni exploser le support.

Critères minimaux :

- monitoring erreurs en place ;
- alertes Stripe/webhook ;
- parcours utilisateur documenté ;
- onboarding clair ;
- FAQ ou centre d'aide minimal ;
- analytics produit ;
- migrations Supabase propres ;
- RLS Supabase vérifiées ;
- tests complets du parcours ;
- support client organisé ;
- positionnement marketing clair ;
- cible prioritaire définie.

## Checklist technique obligatoire

### Authentification

- Inscription testée en production.
- Confirmation email testée.
- Connexion testée.
- Déconnexion testée.
- Reset password testé.
- Redirections Supabase propres.
- Aucun lien de reset ne renvoie vers une mauvaise page.
- Aucun utilisateur non connecté ne peut accéder aux pages Premium.

### Supabase

- Toutes les migrations nécessaires sont passées.
- Table `profiles` complète.
- Table `clients` créée.
- Table `pricing_calculations` fonctionnelle.
- Table `quotes` fonctionnelle.
- Table `premium_entitlements` fonctionnelle.
- Politiques RLS activées.
- Chaque utilisateur ne voit que ses données.
- Les liens publics de devis ne donnent accès qu'au devis concerné.
- Aucun appel client n'utilise de clé `service_role`.

### Stripe

- Checkout testé en production.
- Webhook Stripe testé.
- Activation Premium automatique testée.
- Paiement échoué testé.
- Résiliation testée.
- Portail de facturation testé.
- Facture Stripe accessible.
- Email utilisé au checkout cohérent avec le compte.
- `client_reference_id` ou metadata user fiable.

### Devis et lien client

- Génération PDF testée.
- PDF visuellement propre.
- Logo entreprise testable.
- Numéro de devis correct.
- Dates et validité correctes.
- Lignes du devis cohérentes.
- Total HT, TVA et TTC cohérents.
- Lien client public fonctionne.
- Client peut télécharger le devis.
- Client peut signer sur canvas.
- Signature affichée après acceptation.
- Acceptation met le statut à jour.
- Refus met le statut à jour.
- Lien expiré selon validité du devis.

### Dashboard

- Tableau de bord lisible sur desktop.
- Dashboard accessible sur mobile.
- Sidebar ou navigation mobile utilisable.
- Opportunités accessibles.
- Suivi démarches lisible.
- Notifications rattachées au devis concerné.
- Portefeuille client fonctionnel.
- Nouveau calcul depuis un client préremplit les informations client.
- Facturation ne contient pas de données fictives.
- Mon compte permet de modifier les informations entreprise.

### PDF et exports

- Export PDF résumé testé.
- Export CSV testé.
- PDF devis testé.
- PDF sans texte inutile ou non professionnel.
- Aucun champ obligatoire manquant ne produit un PDF incohérent.

## Checklist UX obligatoire

- Onboarding simple après inscription.
- CTA clair vers le paiement Premium.
- Message clair si l'utilisateur n'est pas Premium.
- États de chargement visibles.
- Messages d'erreur compréhensibles.
- Toasts discrets et lisibles.
- États vides utiles.
- Aucun texte avec accents cassés.
- Aucun placeholder juridique restant.
- Aucun bouton mort.
- Aucun doublon grossier entre pages.
- Navigation mobile propre.
- Formulaire de calcul compréhensible sans explication externe.

## Checklist légale

- Mentions légales finalisées.
- Conditions Générales d'Utilisation et de Vente finalisées.
- Politique de confidentialité et cookies finalisée.
- Bandeau cookies avec choix Accepter / Refuser / Personnaliser.
- Checkbox d'acceptation CGU/CGV au paiement si le parcours le permet.
- Prix mensuel affiché clairement.
- Résiliation expliquée clairement.
- Droit de rétractation traité.
- Contact RGPD indiqué.
- Médiateur de la consommation à compléter si vente à des particuliers.
- Mentions obligatoires sur les devis à vérifier selon le statut de l'éditeur.

Point critique :

La médiation de la consommation ne doit pas rester vague si Tarifly vend à des particuliers. Il faut désigner le médiateur réellement choisi.

## Checklist données marché

Le benchmark marché est une promesse forte. Il doit être traité comme un produit à part entière.

À vérifier :

- métiers correctement reliés à leurs slugs ;
- régions exactes ;
- villes disponibles ;
- unités cohérentes selon le métier ;
- pas d'unité affichée si aucune donnée n'existe ;
- fallback régional si aucune ville exacte ;
- moyenne régionale cohérente ;
- niveau de confiance affiché ou explicable ;
- données faibles clairement présentées comme indicatives.

Risques :

- utilisateur qui croit que le prix marché est une vérité officielle ;
- moyenne faussée par trop peu de données ;
- métiers trop différents regroupés dans une même catégorie ;
- unités incohérentes entre heure, journée, prestation, m2.

Recommandation :

Commencer par 10 à 30 métiers prioritaires avec données propres plutôt que vouloir couvrir tous les métiers trop vite.

## Analytics à mettre en place

Sans analytics, impossible de piloter la croissance.

Événements minimaux :

- visite landing ;
- clic CTA Premium ;
- checkout ouvert ;
- paiement réussi ;
- compte créé ;
- premier calcul créé ;
- premier devis généré ;
- lien client généré ;
- lien client ouvert ;
- devis signé ;
- devis accepté ;
- devis refusé ;
- abonnement résilié ;
- erreur checkout ;
- erreur génération PDF.

KPI à suivre :

- taux visite vers paiement ;
- taux paiement réussi ;
- taux activation Premium ;
- taux premier devis ;
- taux devis accepté ;
- churn mensuel ;
- revenu mensuel récurrent ;
- support par utilisateur ;
- temps moyen avant premier devis.

## Support client

Avant grande échelle, prévoir :

- adresse support claire ;
- réponse type pour paiement ;
- réponse type pour résiliation ;
- réponse type pour problème de reset password ;
- réponse type pour devis non signé ;
- réponse type pour demande de remboursement ;
- mini FAQ.

À surveiller :

- demandes liées à Stripe ;
- incompréhensions sur la comparaison marché ;
- incompréhensions sur la marge ;
- demandes de personnalisation de devis ;
- bugs mobiles.

## Positionnement commercial

Positionnement recommandé :

Tarifly aide les indépendants et petites entreprises à calculer un prix rentable, générer un devis professionnel et suivre la réponse client depuis un seul outil.

Ne pas vendre Tarifly comme :

- un simple calculateur ;
- une alternative générique à Excel ;
- un logiciel comptable ;
- un outil juridique ;
- une vérité officielle sur les prix du marché.

Promesse à privilégier :

- éviter de sous-facturer ;
- gagner du temps sur les devis ;
- rendre les prix plus défendables ;
- suivre les prospects proprement ;
- savoir si son prix est cohérent avec le marché.

## Prix recommandé

Prix actuel :

- 9,90 EUR TTC / mois.

Avis :

- bon prix pour lancement et acquisition initiale ;
- faible friction ;
- cohérent pour premiers utilisateurs ;
- peut être augmenté plus tard si le produit devient fiable et reconnu.

Prix possible après validation :

- 14,90 EUR / mois pour une offre simple ;
- 19,90 EUR / mois si les devis, le suivi client et les données marché deviennent très solides ;
- offre annuelle avec réduction possible.

Ne pas augmenter avant :

- au moins 50 à 100 utilisateurs payants ;
- rétention correcte ;
- support maîtrisé ;
- preuve que les utilisateurs utilisent réellement devis + suivi.

## Risques principaux

### Risque 1 - Produit perçu comme Excel

Symptôme :

L'utilisateur pense qu'il peut refaire la même chose dans un tableur.

Réponse :

Mettre en avant le lien client, la signature, le suivi commercial, le PDF propre et le benchmark marché.

### Risque 2 - Données marché contestées

Symptôme :

L'utilisateur ne croit pas les prix affichés.

Réponse :

Afficher la donnée comme indicative, ajouter un niveau de confiance, améliorer les données métier par métier.

### Risque 3 - Webhook Stripe instable

Symptôme :

L'utilisateur paie mais n'a pas accès au Premium.

Réponse :

Monitoring, logs, endpoint de confirmation, support rapide.

### Risque 4 - Devis juridiquement incomplet

Symptôme :

Utilisateur utilise un devis qui ne correspond pas à son statut ou secteur.

Réponse :

Message clair : l'utilisateur doit vérifier ses mentions obligatoires selon son activité.

### Risque 5 - Support débordé

Symptôme :

Trop de tickets simples.

Réponse :

FAQ, emails transactionnels, messages d'erreur clairs, onboarding.

## Plan d'action recommandé

### Semaine 1

- Tester le parcours complet en production.
- Retirer les logs de debug.
- Vérifier les migrations Supabase.
- Vérifier Stripe en live.
- Vérifier le reset password.
- Vérifier un vrai devis signé.
- Ajouter Sentry ou équivalent.

### Semaine 2

- Faire tester à 5 à 10 utilisateurs réels.
- Observer sans expliquer.
- Noter les incompréhensions.
- Corriger le formulaire, le dashboard et les devis.
- Mettre une FAQ courte.

### Semaine 3

- Lancer bêta payante à 10 à 30 utilisateurs.
- Suivre les KPI.
- Gérer support manuellement.
- Identifier les métiers les plus réceptifs.

### Semaine 4

- Améliorer les données marché sur les métiers prioritaires.
- Améliorer onboarding.
- Stabiliser les parcours.
- Préparer une communication plus large.

## Go / No-Go grande échelle

Go si :

- paiement et activation Premium fiables ;
- génération devis fiable ;
- signature client fiable ;
- dashboard compréhensible ;
- support maîtrisé ;
- données marché cohérentes sur les métiers ciblés ;
- 30 à 50 clients payants réels ;
- premiers signes de rétention.

No-Go si :

- des utilisateurs paient sans accès Premium ;
- le reset password reste instable ;
- le devis PDF est encore contesté ;
- le lien client casse ;
- les données marché donnent souvent des résultats incohérents ;
- le support reçoit trop de questions basiques ;
- les utilisateurs ne créent pas de devis après paiement.

## Conclusion

Tarifly est prêt pour une bêta payante sérieuse.

Tarifly n'est pas encore prêt pour une grande échelle sans phase de mesure et de fiabilisation.

La priorité n'est pas d'ajouter beaucoup de fonctionnalités. La priorité est de rendre le parcours paiement -> calcul -> devis -> lien client -> signature -> suivi absolument fiable.
