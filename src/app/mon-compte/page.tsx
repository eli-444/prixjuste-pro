import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowUpRight,
  BarChart3,
  Calculator,
  CreditCard,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BillingPortalButton } from '@/components/BillingPortalButton';
import { SignOutButton } from '@/components/SignOutButton';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSupabaseConfig } from '@/lib/supabase/env';

export default async function AccountPage() {
  const { isConfigured } = getSupabaseConfig();
  const supabase = await createServerSupabaseClient();

  if (!isConfigured || !supabase) {
    return (
      <main className="grid h-screen place-items-center bg-slate-100 px-4">
        <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Mon compte</h1>
          <p className="mt-4 leading-7 text-slate-600">
            L'espace compte est momentanement indisponible. Merci de reessayer plus tard.
          </p>
        </section>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion?redirect=/mon-compte');
  }

  const [
    { data: profile },
    { data: entitlement },
    { count: calculationCount },
    { data: purchases },
    { count: quoteCount },
    { data: recentQuotes },
    { data: recentCalculations },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, company_name, company_email, default_tax_percent, default_hourly_rate')
      .eq('id', user.id)
      .maybeSingle(),
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
      .limit(3),
    supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase
      .from('quotes')
      .select('id, public_token, quote_number, status, total_including_tax, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('pricing_calculations')
      .select('id, title, client_name, opportunity_status, recommended_price, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(4),
  ]);

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email;
  const isPremium = Boolean(entitlement);
  const totalQuoteValue = (recentQuotes ?? []).reduce((total, quote) => total + Number(quote.total_including_tax ?? 0), 0);

  return (
    <main className="h-screen overflow-hidden bg-[#f4f8fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-[238px] flex-col bg-brand-900 text-white lg:flex">
        <div className="flex h-[72px] items-center border-b border-white/10 px-5">
          <Link href="/" className="inline-flex">
            <Image src="/logo-nav.png" alt="Tarifly" width={1814} height={902} className="h-11 w-auto rounded-xl bg-white px-2 py-1" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 text-sm font-semibold">
          <DashboardNavItem href="/mon-compte" icon={<LayoutDashboard size={16} />} label="Tableau de bord" active />
          <DashboardNavItem href="/outil" icon={<Calculator size={16} />} label="Nouveau calcul" />
          <DashboardNavItem href="/opportunites" icon={<BarChart3 size={16} />} label="Opportunites" />
          <DashboardNavItem href="/opportunites" icon={<FileText size={16} />} label="Devis" />
          <DashboardNavItem href="/mon-compte" icon={<CreditCard size={16} />} label="Facturation" />
        </nav>

        <div className="m-3 rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-sm font-bold">Tarifly {isPremium ? 'Premium' : 'Gratuit'}</p>
          <p className="mt-1 text-xs leading-5 text-blue-100">
            {isPremium ? 'Acces complet actif.' : 'Premier calcul complet offert.'}
          </p>
          <Link href="/#tarifs" className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-3 py-2 text-xs font-bold text-brand-900">
            Voir l'offre
          </Link>
        </div>
      </aside>

      <section className="h-screen lg:pl-[238px]">
        <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-slate-950">Mon compte</h1>
            <p className="mt-1 truncate text-sm text-slate-500">{displayName}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/outil" className="hidden rounded-xl bg-[linear-gradient(135deg,#061747_0%,#0878f2_55%,#11cfc2_100%)] px-4 py-2 text-sm font-bold text-white shadow-glow sm:inline-flex">
              Nouveau calcul
            </Link>
            <StatusBadge active={isPremium} />
            <SignOutButton className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" />
          </div>
        </header>

        <div className="grid h-[calc(100vh-72px)] gap-4 overflow-hidden p-4 md:p-5 xl:grid-cols-[1fr_300px]">
          <div className="grid min-h-0 gap-4 grid-rows-[auto_1fr]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={<FileText />} label="Devis" value={`${quoteCount ?? 0}`} detail={`${formatEuro(totalQuoteValue)} recents`} tone="blue" />
              <MetricCard icon={<Calculator />} label="Calculs" value={`${calculationCount ?? 0}`} detail="Sauvegardes" tone="aqua" />
              <MetricCard icon={<ShieldCheck />} label="Abonnement" value={isPremium ? 'Actif' : 'Gratuit'} detail="9,90 EUR / mois" tone="green" />
              <MetricCard icon={<Sparkles />} label="Acces" value={isPremium ? 'Illimite' : 'Essai'} detail={isPremium ? 'Premium' : '1 calcul complet'} tone="orange" />
            </div>

            <div className="grid min-h-0 gap-4 xl:grid-cols-[1fr_0.92fr]">
              <Panel title="Derniers calculs" actionHref="/opportunites" actionLabel="Voir tout">
                {recentCalculations && recentCalculations.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {recentCalculations.map((calculation) => (
                      <Link key={calculation.id} href={`/opportunites/${calculation.id}`} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 text-sm transition hover:bg-slate-50">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-950">{calculation.title || 'Calcul sans titre'}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{calculation.client_name || 'Client non renseigne'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-950">{formatEuro(Number(calculation.recommended_price ?? 0))}</p>
                          <p className="mt-1 text-xs text-slate-500">{calculation.opportunity_status ?? 'to_price'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="Aucun calcul sauvegarde." />
                )}
              </Panel>

              <Panel title="Derniers devis" actionHref="/outil" actionLabel="Generer">
                {recentQuotes && recentQuotes.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {recentQuotes.map((quote) => (
                      <div key={quote.id} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-950">Devis {quote.quote_number}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatDate(quote.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-950">{formatEuro(Number(quote.total_including_tax ?? 0))}</p>
                          <Link href={`/devis/${quote.public_token}`} target="_blank" className="mt-1 inline-flex text-xs font-bold text-brand-600">
                            Ouvrir
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="Aucun devis genere." />
                )}
              </Panel>
            </div>
          </div>

          <aside className="grid min-h-0 gap-4 grid-rows-[auto_auto_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-bold">Facturation</h2>
              <div className="mt-3 rounded-xl bg-brand-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Offre</p>
                <p className="mt-1 font-bold text-slate-950">Tarifly Premium</p>
                <p className="mt-1 text-sm text-slate-600">9,90 EUR TTC / mois</p>
              </div>
              <div className="mt-3">
                {isPremium ? (
                  <BillingPortalButton />
                ) : (
                  <Link href="/#tarifs" className="inline-flex w-full justify-center rounded-xl bg-brand-900 px-4 py-3 text-sm font-bold text-white">
                    Voir l'offre premium
                  </Link>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-bold">Profil</h2>
              <div className="mt-3 space-y-2 text-sm">
                <InfoRow label="Entreprise" value={profile?.company_name || 'Non renseigne'} />
                <InfoRow label="Email" value={profile?.company_email || user.email || 'Non renseigne'} />
                <InfoRow label="TVA" value={`${profile?.default_tax_percent ?? 20} %`} />
                <InfoRow label="Taux horaire" value={formatEuro(Number(profile?.default_hourly_rate ?? 0))} />
              </div>
            </section>

            <section className="min-h-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-bold">Paiements recents</h2>
              <div className="mt-3 space-y-2">
                {purchases && purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <div key={purchase.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-950">{formatAmount(purchase.amount_total, purchase.currency)}</span>
                        <PaymentStatus status={purchase.status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(purchase.created_at)}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Aucun paiement rattache." compact />
                )}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function DashboardNavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
        active ? 'bg-brand-600 text-white shadow-glow' : 'text-blue-100 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: 'blue' | 'aqua' | 'green' | 'orange';
}) {
  const tones = {
    blue: 'bg-brand-50 text-brand-600',
    aqua: 'bg-aqua-50 text-aqua-600',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-500',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Panel({ title, actionHref, actionLabel, children }: { title: string; actionHref: string; actionLabel: string; children: React.ReactNode }) {
  return (
    <section className="min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="font-bold">{title}</h2>
        <Link href={actionHref} className="text-sm font-bold text-brand-600 hover:text-aqua-600">
          {actionLabel}
        </Link>
      </div>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="truncate text-right font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function EmptyState({ text, compact }: { text: string; compact?: boolean }) {
  return <div className={`${compact ? 'py-2' : 'p-4'} text-sm leading-6 text-slate-500`}>{text}</div>;
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`hidden rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] sm:inline-flex ${
        active ? 'bg-aqua-50 text-aqua-600' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {active ? 'Premium' : 'Gratuit'}
    </span>
  );
}

function PaymentStatus({ status }: { status: string }) {
  const isPaid = status === 'paid' || status === 'accepted';

  return (
    <span
      className={`inline-flex justify-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
        isPaid ? 'bg-aqua-50 text-aqua-600' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {status}
    </span>
  );
}

function formatEuro(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
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
