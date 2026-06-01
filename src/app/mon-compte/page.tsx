import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, Calculator, CreditCard, FileText, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SignOutButton } from '@/components/SignOutButton';
import { BillingPortalButton } from '@/components/BillingPortalButton';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSupabaseConfig } from '@/lib/supabase/env';

export default async function AccountPage() {
  const { isConfigured } = getSupabaseConfig();
  const supabase = await createServerSupabaseClient();

  if (!isConfigured || !supabase) {
    return (
      <>
        <Header />
        <main className="bg-slate-100 px-4 py-16">
          <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Mon compte</h1>
            <p className="mt-4 leading-7 text-slate-600">
              L'espace compte est momentanement indisponible. Merci de reessayer plus tard.
            </p>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion?redirect=/mon-compte');
  }

  const [{ data: profile }, { data: entitlement }, { count: calculationCount }, { data: purchases }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    supabase
      .from('premium_entitlements')
      .select('status, source, valid_until, updated_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle(),
    supabase.from('pricing_calculations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase
      .from('purchases')
      .select('id, amount_total, currency, status, created_at, stripe_session_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email;
  const isPremium = Boolean(entitlement);

  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-12 md:py-16">
        <section className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Espace client</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Mon compte</h1>
              <p className="mt-3 text-slate-600">{displayName}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/opportunites"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Ouvrir le pipeline
                <ArrowUpRight size={16} />
              </Link>
              <SignOutButton />
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <section className="border-b border-slate-200 p-6 md:p-8 lg:border-b-0 lg:border-r">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <ShieldCheck size={20} />
                      </span>
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                          {isPremium ? 'Tarifly Premium est actif' : 'Tarifly Premium est inactif'}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <p className="mt-5 max-w-2xl leading-7 text-slate-600">
                      {isPremium
                        ? 'Votre abonnement mensuel donne acces au diagnostic complet, aux exports PDF et aux sauvegardes de calculs.'
                        : 'Passez en Premium pour debloquer le diagnostic complet, les exports PDF et les sauvegardes avancees.'}
                    </p>
                  </div>
                  <StatusBadge active={isPremium} />
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <SummaryItem icon={<Calculator />} label="Calculs sauvegardes" value={`${calculationCount ?? 0}`} />
                  <SummaryItem icon={<CreditCard />} label="Abonnement" value={isPremium ? 'Actif' : 'Aucun'} />
                  <SummaryItem icon={<FileText />} label="Documents" value={purchases?.length ? `${purchases.length}` : '0'} />
                </div>
              </section>

              <aside className="p-6 md:p-8">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">Facturation</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {isPremium
                    ? 'Gerez votre abonnement, vos moyens de paiement et vos factures depuis le portail securise Stripe.'
                    : 'Aucun abonnement actif pour le moment. Vous pouvez demarrer Tarifly Premium depuis la page tarifs.'}
                </p>

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">Offre</p>
                  <p className="mt-1 font-bold text-slate-950">Tarifly Premium</p>
                  <p className="mt-1 text-sm text-slate-600">9,90 EUR TTC / mois, sans engagement.</p>
                </div>

                <div className="mt-6">
                  {isPremium ? (
                    <BillingPortalButton />
                  ) : (
                    <Link
                      href="/#tarifs"
                      className="inline-flex w-full justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Voir l'offre premium
                    </Link>
                  )}
                </div>
              </aside>
            </div>
          </div>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">Historique</h2>
                <p className="mt-2 text-sm text-slate-500">Les derniers paiements enregistres pour ce compte.</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              {purchases && purchases.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="grid gap-3 p-4 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
                      <div>
                        <p className="font-semibold text-slate-950">{formatDate(purchase.created_at)}</p>
                        <p className="mt-1 text-slate-500">Reference {purchase.stripe_session_id?.slice(-10) ?? purchase.id.slice(0, 8)}</p>
                      </div>
                      <p className="font-semibold text-slate-950">{formatAmount(purchase.amount_total, purchase.currency)}</p>
                      <PaymentStatus status={purchase.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-sm leading-6 text-slate-600">
                  Aucun paiement n'est encore rattache a ce compte.
                </div>
              )}
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
        active ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {active ? 'Premium' : 'Gratuit'}
    </span>
  );
}

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-slate-500">{icon}</div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function PaymentStatus({ status }: { status: string }) {
  const isPaid = status === 'paid';

  return (
    <span
      className={`inline-flex justify-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
        isPaid ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {status}
    </span>
  );
}

function formatAmount(amount: number | null, currency: string | null) {
  if (typeof amount !== 'number') {
    return 'Montant indisponible';
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: (currency ?? 'eur').toUpperCase(),
  }).format(amount / 100);
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Date indisponible';
  }

  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}
