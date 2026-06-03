import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, Calculator, CreditCard, FileText, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SignOutButton } from '@/components/SignOutButton';
import { BillingPortalButton } from '@/components/BillingPortalButton';
import { PreferencesForm } from '@/components/PreferencesForm';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSupabaseConfig } from '@/lib/supabase/env';
import type { Profession } from '@/lib/market';

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

  const [
    { data: profile },
    { data: entitlement },
    { count: calculationCount },
    { data: purchases },
    { data: professions },
    { count: quoteCount },
    { data: recentQuotes },
  ] =
    await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, activity_type, profession_slug, city, region, default_tax_percent, default_hourly_rate, company_name, company_address, company_email, company_phone')
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
  ]);

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email;
  const isPremium = Boolean(entitlement);

  return (
    <>
      <Header />
      <main className="bg-[linear-gradient(180deg,#eefcff_0%,#f8fbff_42%,#f4f9fb_100%)] px-4 py-10 md:py-14">
        <section className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-brand-100 bg-brand-900 text-white shadow-glow">
            <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-aqua-100">Dashboard Tarifly</p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Pilotez vos prix, devis et abonnements.</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
                  {displayName} · retrouvez votre statut Premium, vos devis clients, vos calculs sauvegardes et vos
                  preferences de facturation au meme endroit.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/outil"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition hover:bg-blue-50"
                >
                  Nouveau calcul
                  <ArrowUpRight size={16} />
                </Link>
                <Link
                  href="/opportunites"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Pipeline commercial
                  <ArrowUpRight size={16} />
                </Link>
                <SignOutButton />
              </div>
            </div>

            <div className="grid border-t border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardStat icon={<Calculator />} label="Calculs" value={`${calculationCount ?? 0}`} />
              <DashboardStat icon={<FileText />} label="Devis generes" value={`${quoteCount ?? 0}`} />
              <DashboardStat icon={<CreditCard />} label="Abonnement" value={isPremium ? 'Actif' : 'Gratuit'} />
              <DashboardStat icon={<ShieldCheck />} label="Statut" value={isPremium ? 'Premium' : 'Essai'} />
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-soft">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <section className="border-b border-brand-100 p-6 md:p-8 lg:border-b-0 lg:border-r">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-aqua-50 text-aqua-600">
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
                  <SummaryItem icon={<FileText />} label="Devis generes" value={`${quoteCount ?? 0}`} />
                </div>
              </section>

              <aside className="p-6 md:p-8">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">Facturation</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {isPremium
                    ? 'Gerez votre abonnement, vos moyens de paiement et vos factures depuis le portail securise Stripe.'
                    : 'Aucun abonnement actif pour le moment. Vous pouvez demarrer Tarifly Premium depuis la page tarifs.'}
                </p>

                <div className="mt-6 rounded-2xl border border-brand-100 bg-[linear-gradient(135deg,#eefcff_0%,#ffffff_100%)] p-4">
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
                      className="inline-flex w-full justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-aqua-500 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-105"
                    >
                      Voir l'offre premium
                    </Link>
                  )}
                </div>
              </aside>
            </div>
          </div>

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

          <section className="mt-8 rounded-3xl border border-brand-100 bg-white p-6 shadow-soft md:p-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">Devis sauvegardes</h2>
                <p className="mt-2 text-sm text-slate-500">Les derniers devis generes depuis l'outil.</p>
              </div>
              <Link href="/outil" className="text-sm font-semibold text-brand-600 transition hover:text-aqua-600">
                Nouveau devis
              </Link>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-brand-100">
              {recentQuotes && recentQuotes.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {recentQuotes.map((quote) => (
                    <div key={quote.id} className="grid gap-3 p-4 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
                      <div>
                        <p className="font-semibold text-slate-950">Devis {quote.quote_number}</p>
                        <p className="mt-1 text-slate-500">{formatDate(quote.created_at)}</p>
                        <Link href={`/devis/${quote.public_token}`} target="_blank" className="mt-2 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
                          Lien client
                        </Link>
                      </div>
                      <p className="font-semibold text-slate-950">{formatEuro(Number(quote.total_including_tax ?? 0))}</p>
                      <PaymentStatus status={quote.status ?? 'generated'} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-sm leading-6 text-slate-600">
                  Aucun devis n'a encore ete genere depuis l'outil.
                </div>
              )}
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-brand-100 bg-white p-6 shadow-soft md:p-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">Historique</h2>
                <p className="mt-2 text-sm text-slate-500">Les derniers paiements enregistres pour ce compte.</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-brand-100">
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

function formatEuro(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function DashboardStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border-white/10 p-5 sm:border-r sm:last:border-r-0">
      <div className="text-aqua-100">{icon}</div>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-100">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
        active ? 'bg-aqua-50 text-aqua-600' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {active ? 'Premium' : 'Gratuit'}
    </span>
  );
}

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-[linear-gradient(135deg,#ffffff_0%,#eefcff_100%)] p-4">
      <div className="text-brand-600">{icon}</div>
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
        isPaid ? 'bg-aqua-50 text-aqua-600' : 'bg-slate-100 text-slate-600'
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
