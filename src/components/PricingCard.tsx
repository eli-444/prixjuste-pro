import { Check } from 'lucide-react';
import { CheckoutButton } from './CheckoutButton';

export function PricingCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
      <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-600">
        Abonnement mensuel
      </div>
      <div className="mt-5 flex items-end gap-2">
        <span className="text-5xl font-bold tracking-tight text-slate-950">9,90 EUR</span>
        <span className="pb-2 text-sm font-medium text-slate-500">TTC / mois</span>
      </div>
      <p className="mt-3 text-slate-600">
        Debloquez l'analyse complete de rentabilite, le niveau de risque et une justification commerciale prete a
        utiliser. Sans engagement, resiliable depuis votre compte.
      </p>
      <ul className="mt-6 space-y-3 text-sm text-slate-700">
        {[
          'Prix recommande pour votre prestation',
          'Analyse de marge et de rentabilite',
          'Lecture du risque commercial',
          'Justification client prete a reprendre',
          'Export PDF professionnel',
          'Abonnement mensuel sans engagement',
        ].map((item) => (
          <li key={item} className="flex items-center gap-3">
            <Check className="h-4 w-4 text-brand-600" />
            {item}
          </li>
        ))}
      </ul>
      <CheckoutButton className="mt-8 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">
        Demarrer l'abonnement premium
      </CheckoutButton>
      <p className="mt-3 text-center text-xs leading-5 text-slate-500">
        Prelevement mensuel. Vous pouvez resilier a tout moment depuis votre espace compte.
      </p>
    </div>
  );
}
