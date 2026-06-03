import { redirect } from 'next/navigation';
import { BillingPortalButton } from '@/components/BillingPortalButton';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function DashboardBillingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user || !supabase) {
    redirect('/connexion?redirect=/dashboard/facturation');
  }

  const [{ data: entitlement }, { data: purchases }] = await Promise.all([
    supabase.from('premium_entitlements').select('status, updated_at').eq('user_id', user.id).eq('status', 'active').maybeSingle(),
    supabase.from('purchases').select('id, amount_total, currency, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8),
  ]);

  return (
    <div className="h-full overflow-hidden p-4 md:p-5">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Facturation</h1>
        <p className="mt-1 text-sm text-slate-500">Abonnement, paiements et statut de facturation.</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold">Tarifly Premium</h2>
          <p className="mt-2 text-sm text-slate-600">9,90 EUR TTC / mois</p>
          <p className="mt-3 text-sm font-semibold text-slate-950">Statut : {entitlement ? 'Actif' : 'Inactif'}</p>
          <div className="mt-4">{entitlement ? <BillingPortalButton /> : null}</div>
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {purchases && purchases.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="grid gap-3 p-4 text-sm md:grid-cols-[1fr_140px_120px] md:items-center">
                  <p className="font-semibold text-slate-950">{formatDate(purchase.created_at)}</p>
                  <p className="font-bold">{formatAmount(purchase.amount_total, purchase.currency)}</p>
                  <p className="font-semibold text-slate-600">{purchase.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-sm text-slate-500">Aucun paiement rattache a ce compte.</div>
          )}
        </section>
      </div>
    </div>
  );
}

function formatAmount(amount: number | null, currency: string | null) {
  if (typeof amount !== 'number') return 'Montant indisponible';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: (currency ?? 'eur').toUpperCase() }).format(amount / 100);
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value)) : 'Date indisponible';
}
