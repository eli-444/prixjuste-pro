import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { statusLabels, type OpportunityStatus } from '@/lib/opportunities';

type CalculationRow = {
  id: string;
  title: string | null;
  client_name: string | null;
  opportunity_status: OpportunityStatus | null;
  recommended_price: number | null;
  created_at: string;
};

export default async function DashboardOpportunitiesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user || !supabase) {
    redirect('/connexion?redirect=/dashboard/opportunites');
  }

  const { data } = await supabase
    .from('pricing_calculations')
    .select('id, title, client_name, opportunity_status, recommended_price, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(12);

  const rows = (data ?? []) as CalculationRow[];

  return (
    <DashboardPageShell title="Opportunites" description="Suivez vos opportunites commerciales et rouvrez un calcul sauvegarde.">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {rows.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {rows.map((row) => (
              <Link key={row.id} href={`/opportunites/${row.id}`} className="grid gap-3 p-4 text-sm transition hover:bg-slate-50 md:grid-cols-[1fr_160px_140px_auto] md:items-center">
                <div>
                  <p className="font-bold text-slate-950">{row.title || 'Calcul sans titre'}</p>
                  <p className="mt-1 text-slate-500">{row.client_name || 'Client non renseigne'}</p>
                </div>
                <p className="font-semibold text-slate-700">{statusLabels[row.opportunity_status ?? 'to_price']}</p>
                <p className="font-bold text-slate-950">{formatCurrency(Number(row.recommended_price ?? 0))}</p>
                <ArrowUpRight size={16} className="text-slate-400" />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState text="Aucune opportunite sauvegardee." />
        )}
      </div>
    </DashboardPageShell>
  );
}

function DashboardPageShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="h-full overflow-hidden p-4 md:p-5">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </header>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="p-6 text-sm text-slate-500">{text}</div>;
}
