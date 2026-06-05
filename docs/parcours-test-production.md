# Tarifly - Parcours de test avant déploiement production

Dernière mise à jour : 05/06/2026

Ce fichier sert de protocole court avant chaque déploiement important.

## 1. Authentification

- Créer un compte avec une adresse e-mail de test.
- Confirmer le compte depuis l'e-mail reçu.
- Se connecter.
- Se déconnecter.
- Demander un reset password.
- Vérifier que le lien renvoie vers la bonne page.
- Modifier le mot de passe.
- Se reconnecter avec le nouveau mot de passe.

Validation attendue :

- aucune erreur `auth_callback` ;
- aucun retour vers une mauvaise page ;
- messages utilisateur clairs.

## 2. Paiement Premium

- Aller sur la page Facturation sans abonnement.
- Vérifier le prix affiché : 9,90 EUR TTC / mois.
- Vérifier la checkbox CGU/CGV + confidentialité.
- Tenter de payer sans cocher la checkbox.
- Cocher la checkbox.
- Lancer Stripe Checkout.
- Payer en mode test ou live selon l'environnement.
- Revenir sur la page succès.
- Vérifier que Premium est actif.
- Vérifier que l'accès à l'outil est débloqué.

Validation attendue :

- checkout impossible sans acceptation légale ;
- paiement rattaché au bon compte ;
- entitlement Premium créé ;
- dashboard accessible.

## 3. Résiliation

- Aller dans Mon compte.
- Ouvrir le portail de facturation.
- Résilier l'abonnement.
- Vérifier dans Stripe que l'abonnement est bien marqué comme résilié ou prévu pour annulation.
- Vérifier le comportement côté application.

Validation attendue :

- bouton de résiliation disponible ;
- aucune page morte ;
- message Stripe cohérent.

## 4. Calcul et sauvegarde

- Créer un nouveau calcul.
- Renseigner un client/prospect.
- Renseigner les coûts.
- Choisir un métier et une région.
- Vérifier que les villes/unités de marché sont cohérentes.
- Sauvegarder l'opportunité.
- Recharger l'application.
- Réouvrir l'opportunité.

Validation attendue :

- les informations sont sauvegardées ;
- le benchmark marché s'affiche si les données existent ;
- aucun champ ne force un `0` impossible à supprimer ;
- aucun texte avec accent cassé dans l'interface.

## 5. Portefeuille client

- Ajouter un client depuis le dashboard.
- Renseigner nom, adresse, e-mail et téléphone.
- Cliquer sur `Nouveau calcul`.
- Vérifier que les informations client sont préremplies dans l'outil.
- Générer ensuite un devis.

Validation attendue :

- le client est enregistré ;
- le calcul reprend le nom du client ;
- le devis reprend nom, adresse et e-mail du client.

## 6. Devis PDF

- Ouvrir la modale de devis.
- Vérifier que les informations entreprise sont préremplies depuis Mon compte.
- Modifier le numéro de devis.
- Ajouter plusieurs lignes.
- Vérifier HT, TVA et TTC.
- Ajouter ou modifier le logo.
- Générer le PDF.

Validation attendue :

- PDF propre visuellement ;
- logo visible sans être coupé ;
- données client correctes ;
- totaux cohérents ;
- aucune phrase interne visible côté client.

## 7. Lien client public

- Générer un lien client.
- Ouvrir le lien dans un navigateur non connecté.
- Télécharger le devis.
- Signer sur le canvas.
- Accepter le devis.
- Revenir dans le dashboard.

Validation attendue :

- le client n'a pas besoin de compte ;
- signature enregistrée ;
- signature visible après acceptation ;
- statut `Accepté` dans le suivi des démarches ;
- notification rattachée au devis concerné.

## 8. Refus de devis

- Générer un autre lien client.
- Ouvrir le lien public.
- Refuser le devis.
- Vérifier le dashboard.

Validation attendue :

- statut `Refusé` visible ;
- notification rattachée au devis concerné ;
- les données marché ne sont pas alimentées comme un devis accepté.

## 9. Facturation et historique

- Vérifier la page Facturation avec paiement.
- Vérifier la page Facturation sans paiement.
- Vérifier l'état vide.
- Vérifier le lien `Aide facturation`.

Validation attendue :

- pas de données fictives ;
- pas de bloc marketing inutile si l'utilisateur est déjà Premium ;
- historique sobre et lisible.

## 10. Pages publiques et légales

- Page d'accueil.
- Page Aide.
- Mentions légales.
- Conditions.
- Confidentialité & cookies.
- Bandeau cookies.
- Préférences cookies.

Validation attendue :

- aucun placeholder ;
- adresse éditeur correcte ;
- prix cohérent ;
- contact RGPD visible ;
- cookies acceptables/refusables/personnalisables ;
- liens footer fonctionnels.

## 11. Mobile

- Dashboard mobile.
- Navigation dashboard mobile.
- Outil mobile.
- Devis public mobile.
- Signature canvas mobile.

Validation attendue :

- pas de contenu inaccessible ;
- boutons visibles ;
- formulaire utilisable ;
- signature possible.

## 12. Dernière vérification technique

Commandes recommandées :

```bash
npx tsc --noEmit --pretty false
npm run build
```

Recherche rapide :

```bash
rg "TODO|FIXME|console\\.log|console\\.info|localhost|127\\.0\\.0\\.1|à renseigner|adresse complète" src docs supabase.sql
```

Validation attendue :

- TypeScript OK ;
- build OK ;
- aucun log debug ;
- aucun placeholder juridique.
