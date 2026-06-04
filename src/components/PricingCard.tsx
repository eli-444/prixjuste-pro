import { Check } from 'lucide-react';
import { CheckoutButton } from './CheckoutButton';

export function PricingCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-950 shadow-soft">
      <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-black text-brand-600">
        Abonnement mensuel
      </div>
      <div className="mt-5 flex items-end gap-2">
        <span className="text-5xl font-black tracking-tight text-brand-900">9,90 EUR</span>
        <span className="pb-2 text-sm font-medium text-slate-500">TTC / mois</span>
      </div>
      <p className="mt-3 leading-7 text-slate-600">
        Débloquez le calcul complet, la comparaison marché, les devis professionnels, le lien client, la signature
        électronique et le suivi commercial. Sans engagement, résiliable depuis votre compte.
      </p>
      <ul className="mt-6 space-y-3 text-sm text-slate-700">
        {[
          'Calculs complets pour vos prestations',
          'Analyse de marge et de rentabilité',
          'Comparaison marché par métier et zone',
          'Lecture du risque commercial',
          'Génération de devis professionnels',
          'Lien public client et signature électronique',
          'Suivi accepté / refusé dans le dashboard',
          'Export PDF professionnel',
          'Abonnement mensuel sans engagement',
        ].map((item) => (
          <li key={item} className="flex items-center gap-3">
            <Check className="h-4 w-4 shrink-0 text-brand-600" />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-6 rounded-2xl border border-aqua-100 bg-aqua-50 px-4 py-3 text-sm font-black leading-6 text-teal-950">
        Un seul devis mieux tarifé peut rentabiliser plusieurs mois d’abonnement.
      </p>
      <CheckoutButton className="mt-5 w-full rounded-2xl bg-brand-900 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-950">
        Démarrer l’abonnement Premium
      </CheckoutButton>
      <p className="mt-3 text-center text-xs leading-5 text-slate-500">
        Prélèvement mensuel. Vous pouvez résilier à tout moment depuis votre espace compte.
      </p>
    </div>
  );
}
