import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2, Calculator, CreditCard, UserCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SignOutButton } from '@/components/SignOutButton';
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
              La rubrique est prete. Ajoutez vos variables Supabase dans `.env.local`, lancez le script SQL dans
              Supabase, puis la connexion sera active.
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

  const [{ data: profile }, { data: entitlement }, { count: calculationCount }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    supabase
      .from('premium_entitlements')
      .select('status, source, valid_until')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle(),
    supabase.from('pricing_calculations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
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
            <AccountMetric
              icon={<CreditCard />}
              label="Premium"
              value={entitlement ? 'Actif' : 'Non active'}
              accent={Boolean(entitlement)}
            />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">Votre espace est pret</h2>
              <div className="mt-5 space-y-3 text-slate-600">
                <p className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-brand-600" />
                  Connexion, inscription et deconnexion sont branchees sur Supabase Auth.
                </p>
                <p className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-brand-600" />
                  Le script SQL cree les tables necessaires pour relier calculs, achats Stripe et droits premium.
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
              <h2 className="text-xl font-bold tracking-tight text-slate-950">Actions rapides</h2>
              <div className="mt-5 grid gap-3">
                <Link href="/outil" className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white">
                  Ouvrir le calculateur
                </Link>
                <Link href="/#tarifs" className="rounded-2xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-950">
                  Voir l'offre premium
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
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
