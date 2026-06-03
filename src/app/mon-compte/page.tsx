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
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BillingPortalButton } from '@/components/BillingPortalButton';
import { PreferencesForm } from '@/components/PreferencesForm';
import { SignOutButton } from '@/components/SignOutButton';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSupabaseConfig } from '@/lib/supabase/env';
import type { Profession } from '@/lib/market';

export default async function AccountPage() {
  const { isConfigured } = getSupabaseConfig();
  const supabase = await createServerSupabaseClient();

  if (!isConfigured || !supabase) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-16">
        <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
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
    { data: professions },
    { count: quoteCount },
    { data: recentQuotes },
    { data: recentCalculations },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'full_name, activity_type, profession_slug, city, region, default_tax_percent, default_hourly_rate, company_name, company_address, company_email, company_phone',
      )
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
      .limit(5),
    supabase.from('professions').select('slug, label, activity_type').eq('active', true).order('label', { ascending: true }),
    supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase
      .from('quotes')
      .select('id, public_token, quote_number, status, total_including_tax, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('pricing_calculations')
      .select('id, title, client_name, opportunity_status, recommended_price, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email;
  const isPremium = Boolean(entitlement);
  const totalQuoteValue = (recentQuotes ?? []).reduce((total, quote) => total + Number(quote.total_including_tax ?? 0), 0);

  return (
    <main className="min-h-screen bg-[#f4f8fb] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden bg-brand-900 text-white lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-6 py-5">
            <Link href="/" className="inline-flex">
              <Image src="/logo-nav.png" alt="Tarifly" width={1814} height={902} className="h-12 w-auto rounded-xl bg-white px-2 py-1" />
            </Link>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6 text-sm font-semibold">
            <DashboardNavItem href="/mon-compte" icon={<LayoutDashboard size={17} />} label="Tableau de bord" active />
            <DashboardNavItem href="/outil" icon={<Calculator size={17} />} label="Nouveau calcul" />
            <DashboardNavItem href="/opportunites" icon={<BarChart3 size={17} />} label="Opportunites" />
            <DashboardNavItem href="/mon-compte#devis" icon={<FileText size={17} />} label="Devis" />
            <DashboardNavItem href="/mon-compte#facturation" icon={<CreditCard size={17} />} label="Facturation" />
            <DashboardNavItem href="/mon-compte#preferences" icon={<Settings size={17} />} label="Parametres" />
          </nav>
          <div className="m-4 rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-sm font-bold">Tarifly {isPremium ? 'Premium' : 'Gratuit'}</p>
            <p className="mt-2 text-xs leading-5 text-blue-100">
              {isPremium ? 'Acces complet actif.' : 'Premier calcul complet offert, puis Premium.'}
            </p>
            <Link href="/#tarifs" className="mt-4 inline-flex w-full justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand-900">
              Voir l'offre
            </Link>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Dashboard</p>
                <h1 className="mt-1 truncate text-2xl font-bold tracking-tight md:text-3xl">Bonjour, {displayName}</h1>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/outil" className="hidden rounded-xl bg-[linear-gradient(135deg,#061747_0%,#0878f2_55%,#11cfc2_100%)] px-4 py-2 text-sm font-bold text-white shadow-glow sm:inline-flex">
                  Nouveau calcul
                </Link>
                <StatusBadge active={isPremium} />
                <SignOutButton className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" />
              </div>
            </div>
          </header>

          <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard icon={<FileText />} label="Devis generes" value={`${quoteCount ?? 0}`} detail={`${formatEuro(totalQuoteValue)} recents`} tone="blue" />
                <MetricCard icon={<Calculator />} label="Calculs sauvegardes" value={`${calculationCount ?? 0}`} detail="Opportunites chiffrees" tone="aqua" />
                <MetricCard icon={<ShieldCheck />} label="Abonnement" value={isPremium ? 'Actif' : 'Gratuit'} detail="9,90 EUR TTC / mois" tone="green" />
                <MetricCard icon={<Sparkles />} label="Acces" value={isPremium ? 'Illimite' : 'Essai'} detail={isPremium ? 'Premium actif' : '1 calcul complet'} tone="orange" />
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">Derniers calculs</h2>
                    <p className="mt-1 text-sm text-slate-500">Vos opportunites recemment chiffrees.</p>
                  </div>
                  <Link href="/opportunites" className="text-sm font-bold text-brand-600 hover:text-aqua-600">
                    Voir le pipeline
                  </Link>
                </div>
                <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                  {recentCalculations && recentCalculations.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                      {recentCalculations.map((calculation) => (
                        <Link key={calculation.id} href={`/opportunites/${calculation.id}`} className="grid gap-3 p-4 text-sm transition hover:bg-slate-50 md:grid-cols-[1fr_130px_130px_auto] md:items-center">
                          <div>
                            <p className="font-bold text-slate-950">{calculation.title || 'Calcul sans titre'}</p>
                            <p className="mt-1 text-slate-500">{calculation.client_name || 'Client non renseigne'}</p>
                          </div>
                          <p className="font-semibold text-slate-700">{calculation.opportunity_status ?? 'to_price'}</p>
                          <p className="font-bold text-slate-950">{formatEuro(Number(calculation.recommended_price ?? 0))}</p>
                          <ArrowUpRight size={16} className="text-slate-400" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="Aucun calcul sauvegarde pour le moment." />
                  )}
                </div>
              </section>

              <section id="devis" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">Derniers devis</h2>
                    <p className="mt-1 text-sm text-slate-500">Liens clients et statuts recents.</p>
                  </div>
                  <Link href="/outil" className="text-sm font-bold text-brand-600 hover:text-aqua-600">
                    Generer un devis
                  </Link>
                </div>
                <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                  {recentQuotes && recentQuotes.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                      {recentQuotes.map((quote) => (
                        <div key={quote.id} className="grid gap-3 p-4 text-sm md:grid-cols-[1fr_130px_110px_auto] md:items-center">
                          <div>
                            <p className="font-bold text-slate-950">Devis {quote.quote_number}</p>
                            <p className="mt-1 text-slate-500">{formatDate(quote.created_at)}</p>
                          </div>
                          <p className="font-bold text-slate-950">{formatEuro(Number(quote.total_including_tax ?? 0))}</p>
                          <PaymentStatus status={quote.status ?? 'generated'} />
                          <Link href={`/devis/${quote.public_token}`} target="_blank" className="font-bold text-brand-600 hover:text-aqua-600">
                            Ouvrir
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="Aucun devis genere pour le moment." />
                  )}
                </div>
              </section>

              <section id="preferences" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <PreferencesForm
                  userId={user.id}
                  professions={(professions ?? []) as Profession[]}
                  initialValues={{
                    fullName: profile?.full_name ?? '',
                    activityType: profile?.activity_type ?? 'service',
                    professionSlug: profile?.profession_slug ?? '',
                    region: profile?.region ?? '',
                    city: profile?.city ?? '',
                    defaultTaxPercent: String(profile?.default_tax_percent ?? 20),
                    defaultHourlyRate: String(profile?.default_hourly_rate ?? 0),
                    companyName: profile?.company_name ?? '',
                    companyAddress: profile?.company_address ?? '',
                    companyEmail: profile?.company_email ?? user.email ?? '',
                    companyPhone: profile?.company_phone ?? '',
                  }}
                />
              </section>
            </div>

            <aside className="space-y-6">
              <section id="facturation" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-bold">Facturation</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {isPremium
                    ? 'Votre abonnement est actif. Vous pouvez gerer vos factures et votre resiliation depuis Stripe.'
                    : 'Aucun abonnement actif pour le moment.'}
                </p>
                <div className="mt-5 rounded-xl bg-brand-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">Offre</p>
                  <p className="mt-1 font-bold text-slate-950">Tarifly Premium</p>
                  <p className="mt-1 text-sm text-slate-600">9,90 EUR TTC / mois</p>
                </div>
                <div className="mt-5">
                  {isPremium ? (
                    <BillingPortalButton />
                  ) : (
                    <Link href="/#tarifs" className="inline-flex w-full justify-center rounded-xl bg-brand-900 px-4 py-3 text-sm font-bold text-white">
                      Voir l'offre premium
                    </Link>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-bold">Actions rapides</h2>
                <div className="mt-4 grid gap-3">
                  <QuickAction href="/outil" label="Nouveau calcul" icon={<Calculator size={17} />} />
                  <QuickAction href="/opportunites" label="Pipeline commercial" icon={<BarChart3 size={17} />} />
                  <QuickAction href="/mon-compte#preferences" label="Preferences" icon={<Settings size={17} />} />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-bold">Paiements recents</h2>
                <div className="mt-4 space-y-3">
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
                    <p className="text-sm leading-6 text-slate-500">Aucun paiement rattache a ce compte.</p>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardNavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-12 w-12 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:bg-slate-50">
      <span className="text-brand-600">{icon}</span>
      {label}
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="p-6 text-sm leading-6 text-slate-500">{text}</div>;
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
      className={`inline-flex justify-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${
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
