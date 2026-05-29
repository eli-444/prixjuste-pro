# Tarifly

Tarifly est un mini SaaS Next.js qui aide les professionnels a calculer un prix de vente rentable a partir de leurs couts, de leur temps, de leurs frais et de leur marge cible.

## Fonctionnalites

- Calculateur de prix avec couts, temps, frais, marge cible, TVA et prix concurrent.
- Resultat gratuit avec prix recommande.
- Acces premium Stripe pour debloquer marge, risque, diagnostic, justification client et export.
- Connexion, inscription, deconnexion et rubrique `Mon compte` via Supabase Auth.
- Sauvegarde des calculs pour les utilisateurs connectes.
- Webhook Stripe pret a activer les droits premium dans Supabase.
- Mentions legales et conditions renseignees pour Aurora Web & Security.

## Installation

```bash
npm install
npm run dev
```

Ouvre ensuite :

```bash
http://localhost:3000
```

## Configuration

Copie `.env.example` vers `.env.local`, puis renseigne uniquement tes vraies valeurs Supabase et Stripe :

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyxxxxxxxxxxxxxxxx

STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxxxxxxxxxxxxxxxx
```

## Base Supabase

1. Cree un projet Supabase.
2. Ouvre l'editeur SQL.
3. Execute le fichier `supabase.sql` a la racine du projet.
4. Dans Authentication, active Email/Password.
5. Ajoute ton domaine dans les URL autorisees si tu deployes en production.

Le script cree `profiles`, `pricing_calculations`, `stripe_customers`, `purchases` et `premium_entitlements`, avec RLS et policies utilisateur.

## Stripe

1. Cree un produit `Tarifly - Acces Premium`.
2. Cree un prix en paiement unique, par exemple `9,90 EUR`.
3. Copie le `Price ID` dans `NEXT_PUBLIC_STRIPE_PRICE_ID`.
4. Configure un webhook vers `/api/stripe/webhook`.
5. Ajoute l'evenement `checkout.session.completed`.
6. Copie le secret du webhook dans `STRIPE_WEBHOOK_SECRET`.

En production, remplace `NEXT_PUBLIC_APP_URL` par ton domaine.

## Build

```bash
npm run build
npm run start
```

## Structure utile

```txt
supabase.sql
src/app/connexion/page.tsx
src/app/mon-compte/page.tsx
src/app/api/checkout/route.ts
src/app/api/stripe/webhook/route.ts
src/components/AuthForm.tsx
src/components/SignOutButton.tsx
src/lib/supabase/
```
