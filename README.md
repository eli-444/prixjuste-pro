# Tarifly

Tarifly est un mini SaaS Next.js qui aide les professionnels à calculer un prix de vente rentable à partir de leurs coûts, de leur temps, de leurs frais et de leur marge cible.

## Positionnement

- **Nom :** Tarifly
- **Cible :** indépendants, freelances, artisans, consultants, formateurs, créateurs, prestataires de service et TPE.
- **Problème résolu :** beaucoup de professionnels facturent trop bas parce qu'ils oublient leur temps, leurs frais, leurs charges ou la marge nécessaire pour absorber les imprévus.
- **Promesse :** obtenir rapidement un prix recommandé, un diagnostic de rentabilité et une justification commerciale prête à reprendre dans un devis.
- **Monétisation :** version gratuite limitée + achat Stripe pour débloquer l'analyse complète, l'export et la justification client.
- **Prix conseillé :** 9,90 € en paiement unique.
- **Gratuit :** calcul rapide avec résultat résumé.
- **Payant :** résultat complet, diagnostic détaillé, export texte, justification client et checklist de rentabilité.

## Installation

```bash
npm install
npm run dev
```

Ouvre ensuite :

```bash
http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Configuration Stripe

1. Va dans ton dashboard Stripe.
2. Crée un produit : `Tarifly - Accès Premium`.
3. Crée un prix en paiement unique, par exemple `9,90 €`.
4. Copie le `Price ID`.
5. Crée un fichier `.env.local` à la racine :

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

En production Vercel, remplace `NEXT_PUBLIC_APP_URL` par ton domaine :

```env
NEXT_PUBLIC_APP_URL=https://ton-domaine.fr
```

## Déploiement Vercel

1. Push le projet sur GitHub.
2. Importe le repo dans Vercel.
3. Ajoute les variables d'environnement :
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_STRIPE_PRICE_ID`
   - `NEXT_PUBLIC_APP_URL`
4. Déploie.
5. Teste un achat avec une carte de test Stripe : `4242 4242 4242 4242`.

## Logique premium

La V1 utilise une logique volontairement simple :

- L'utilisateur clique sur acheter.
- Stripe Checkout encaisse le paiement.
- Stripe redirige vers `/success`.
- La page `/success` active `tarifly_premium=true` dans le navigateur.
- L'outil débloque les résultats premium et les exports.

C'est suffisant pour une première version vendable sans authentification ni base de données.

Pour une V2 plus robuste, tu peux ajouter Supabase + authentification + webhook Stripe.

## Structure

```txt
src/
  app/
    api/checkout/route.ts
    cancel/page.tsx
    conditions/page.tsx
    mentions-legales/page.tsx
    outil/page.tsx
    success/page.tsx
    layout.tsx
    page.tsx
    globals.css
  components/
    CheckoutButton.tsx
    Footer.tsx
    Header.tsx
    PricingCard.tsx
    ToolForm.tsx
  lib/
    pricing.ts
    stripe.ts
    utils.ts
```
