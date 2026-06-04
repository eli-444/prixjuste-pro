import { redirect } from 'next/navigation';
import { PricingCard } from '@/components/PricingCard';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function DashboardBillingPage({
  searchParams,
}: {
  searchParams?: Promise<{ paywall?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user || !supabase) {
    redirect('/connexion?redirect=/dashboard/facturation');
  }

  const [{ data: entitlement }, { data: purchases }] = await Promise.all([
    supabase
      .from('premium_entitlements')
      .select('status, updated_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle(),
    supabase
      .from('purchases')
      .select('id, amount_total, currency, status, created_at, stripe_session_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12),
  ]);

  const latestPayment = purchases?.[0];

  return (
    <div className="h-full overflow-auto p-4 md:p-5">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Facturation</h1>
        {!entitlement && params?.paywall ? (
          <p className="mt-2 text-sm font-semibold text-slate-600">
            L’accès au SaaS Tarifly nécessite un abonnement Premium actif.
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <InfoRow label="Abonnement" value={entitlement ? 'Actif' : 'Inactif'} />
          <InfoRow label="Dernier paiement" value={latestPayment ? formatAmount(latestPayment.amount_total, latestPayment.currency) : 'Aucun'} />
          <InfoRow label="Date" value={latestPayment ? formatDate(latestPayment.created_at) : 'Aucune'} />
          <InfoRow label="Statut" value={latestPayment?.status ?? 'Aucun'} />
        </section>

        {!entitlement ? (
          <PricingCard />
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {purchases && purchases.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="grid gap-3 p-4 text-sm md:grid-cols-[1fr_140px_120px_160px] md:items-center">
                    <div>
                      <p className="font-semibold text-slate-950">{formatDate(purchase.created_at)}</p>
                      <p className="mt-1 text-xs text-slate-500">Référence {purchase.stripe_session_id?.slice(-10) ?? purchase.id.slice(0, 8)}</p>
                    </div>
                    <p className="font-bold">{formatAmount(purchase.amount_total, purchase.currency)}</p>
                    <p className="font-semibold text-slate-600">{purchase.status}</p>
                    <p className="text-slate-500">Stripe</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-500">Aucun paiement trouvé pour ce compte.</div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 first:pt-0 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-bold text-slate-950">{value}</span>
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
