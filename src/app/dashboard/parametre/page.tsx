import { redirect } from 'next/navigation';
import { PreferencesForm } from '@/components/PreferencesForm';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Profession } from '@/lib/market';

export default async function DashboardSettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user || !supabase) {
    redirect('/connexion?redirect=/dashboard/parametre');
  }

  const [{ data: profile }, { data: professions }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, activity_type, profession_slug, city, region, default_tax_percent, default_hourly_rate, company_name, company_address, company_email, company_phone')
      .eq('id', user.id)
      .maybeSingle(),
    supabase.from('professions').select('slug, label, activity_type').eq('active', true).order('label', { ascending: true }),
  ]);

  return (
    <div className="h-full overflow-auto p-4 md:p-5">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Parametre</h1>
      </header>
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
    </div>
  );
}
