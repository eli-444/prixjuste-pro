import { redirect } from 'next/navigation';
import { CompanyAccountForm } from '@/components/CompanyAccountForm';
import { SignOutButton } from '@/components/SignOutButton';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function DashboardAccountPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user || !supabase) {
    redirect('/connexion?redirect=/dashboard/mon-compte');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type, first_name, last_name, full_name, company_name, siret, company_address, company_email, default_tax_percent, default_hourly_rate')
    .eq('id', user.id)
    .maybeSingle();
  const accountType = profile?.account_type === 'business' ? 'business' : 'personal';
  const nameParts = (profile?.full_name ?? '').split(' ').filter(Boolean);
  const firstName = profile?.first_name ?? nameParts[0] ?? '';
  const lastName = profile?.last_name ?? nameParts.slice(1).join(' ') ?? '';

  return (
    <div className="h-full overflow-hidden p-4 md:p-5">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Mon compte</h1>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,560px)_320px]">
        <CompanyAccountForm
          userId={user.id}
          accountType={accountType}
          initialValues={{
            firstName,
            lastName,
            companyName: profile?.company_name ?? '',
            siret: profile?.siret ?? '',
            companyAddress: profile?.company_address ?? '',
          }}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <InfoRow label="Type de compte" value={accountType === 'business' ? 'Entreprise' : 'Personnel'} />
          <InfoRow label="Titulaire" value={`${firstName} ${lastName}`.trim() || user.email || 'Non renseigne'} />
          {accountType === 'business' ? (
            <>
              <InfoRow label="Entreprise" value={profile?.company_name || 'Non renseigne'} />
              <InfoRow label="SIRET" value={profile?.siret || 'Non renseigne'} />
            </>
          ) : null}
          <InfoRow label="Email" value={profile?.company_email || user.email || 'Non renseigne'} />
          <InfoRow label="TVA par defaut" value={`${profile?.default_tax_percent ?? 20} %`} />
          <InfoRow label="Taux horaire" value={formatEuro(Number(profile?.default_hourly_rate ?? 0))} />
          <div className="mt-5">
            <SignOutButton />
          </div>
        </section>
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

function formatEuro(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}
