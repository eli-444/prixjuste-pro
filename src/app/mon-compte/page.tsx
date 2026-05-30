import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2, Calculator, CreditCard, FileText, UserCircle } from 'lucide-react';
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
          <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
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

  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <section className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Espace client</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Mon compte</h1>
              <p className="mt-3 text-slate-600">{displayName}</p>
            </div>
            <SignOutButton />
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <AccountMetric icon={<UserCircle />} label="Email" value={user.email ?? 'Non renseigne'} />
            <AccountMetric icon={<Calculator />} label="Calculs sauvegardes" value={`${calculationCount ?? 0}`} />
            <AccountMetric icon={<CreditCard />} label="Premium" value={entitlement ? 'Membre actif' : 'Non actif'} accent={Boolean(entitlement)} />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">Vue d'ensemble</h2>
              <div className="mt-5 space-y-3 text-slate-600">
                <p className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-brand-600" />
                  Votre session est active et securisee.
                </p>
                <p className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-brand-600" />
                  Vos calculs sauvegardes et votre acces premium sont rattaches a votre compte.
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">Abonnement</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {entitlement
                      ? 'Votre abonnement mensuel Tarifly Premium est actif.'
                      : "Vous n'avez pas encore d'abonnement premium actif."}
                  </p>
                </div>
                {entitlement ? (
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
                    Premium
                  </span>
                ) : null}
              </div>

              <div className="mt-5 grid gap-3">
                <Link href="/outil" className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white">
                  Ouvrir le calculateur
                </Link>
                {entitlement ? (
                  <BillingPortalButton />
                ) : (
                  <Link href="/#tarifs" className="rounded-2xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-950">
                    Voir l'offre premium
                  </Link>
                )}
              </div>
            </article>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <CreditCard size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">Facturation</h2>
                  <p className="text-sm text-slate-500">Abonnement mensuel, carte et factures.</p>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Statut</p>
                <p className="mt-1 text-lg font-bold text-slate-950">{entitlement ? 'Abonnement actif' : 'Aucun abonnement actif'}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {entitlement
                    ? 'La gestion de l abonnement, des moyens de paiement et des factures se fait dans le portail Stripe securise.'
                    : 'Vous pouvez demarrer un abonnement depuis la page tarifs.'}
                </p>
              </div>
              <div className="mt-5">
                {entitlement ? (
                  <BillingPortalButton />
                ) : (
                  <Link href="/#tarifs" className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
                    Voir les tarifs
                  </Link>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <FileText size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">Historique des paiements</h2>
                  <p className="text-sm text-slate-500">Les derniers paiements detectes par Tarifly.</p>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                {purchases && purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <div key={purchase.id} className="grid gap-2 border-b border-slate-200 p-4 text-sm last:border-b-0 md:grid-cols-[1fr_auto_auto] md:items-center">
                      <div>
                        <p className="font-semibold text-slate-950">{formatDate(purchase.created_at)}</p>
                        <p className="text-slate-500">Session {purchase.stripe_session_id?.slice(-8) ?? 'Stripe'}</p>
                      </div>
                      <p className="font-semibold text-slate-950">{formatAmount(purchase.amount_total, purchase.currency)}</p>
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
                        {purchase.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm leading-6 text-slate-600">Aucun paiement enregistre pour le moment.</p>
                )}
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
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

function AccountMetric({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${accent ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-700'}`}>
        {icon}
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 break-words text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
