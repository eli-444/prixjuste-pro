import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, KanbanSquare, Plus } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { getOpportunityScore, statusLabels, type OpportunityStatus } from '@/lib/opportunities';
import type { PricingResult } from '@/lib/pricing';

type CalculationRow = {
  id: string;
  title: string | null;
  client_name: string | null;
  opportunity_status: OpportunityStatus | null;
  probability: number | null;
  deadline: string | null;
  client_budget: number | null;
  next_action: string | null;
  recommended_price: number | null;
  result: PricingResult;
  created_at: string;
};

export default async function OpportunitiesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user || !supabase) {
    redirect('/connexion?redirect=/opportunites');
  }

  const { data: calculations } = await supabase
    .from('pricing_calculations')
    .select('id, title, client_name, opportunity_status, probability, deadline, client_budget, next_action, recommended_price, result, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const rows = (calculations ?? []) as CalculationRow[];
  const openRows = rows.filter((row) => !['won', 'lost'].includes(row.opportunity_status ?? ''));
  const potentialRevenue = openRows.reduce((total, row) => total + Number(row.recommended_price ?? 0), 0);
  const averageMargin =
    rows.length > 0 ? rows.reduce((total, row) => total + Number(row.result?.marginRate ?? 0), 0) / rows.length : 0;

  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-12 md:py-16">
        <section className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Pipeline</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Opportunites</h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Suivez vos prospects, appels d'offres et calculs sauvegardes avec une lecture orientee rentabilite.
              </p>
            </div>
            <Link href="/outil" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
              <Plus size={16} />
              Nouvelle opportunite
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <DashboardMetric label="Opportunites ouvertes" value={`${openRows.length}`} />
            <DashboardMetric label="Chiffre potentiel" value={formatCurrency(potentialRevenue)} />
            <DashboardMetric label="Marge moyenne" value={formatPercent(averageMargin)} />
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <KanbanSquare size={18} />
              </span>
              <div>
                <h2 className="font-bold text-slate-950">Tableau commercial</h2>
                <p className="text-sm text-slate-500">Prix recommande, marge, statut et prochaine action.</p>
              </div>
            </div>

            {rows.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {rows.map((row) => {
                  const score = getOpportunityScore({
                    marginRate: row.result?.marginRate ?? 0,
                    probability: row.probability ?? 0,
                    clientBudget: row.client_budget ?? 0,
                    recommendedPrice: Number(row.recommended_price ?? 0),
                  });

                  return (
                    <Link
                      key={row.id}
                      href={`/opportunites/${row.id}`}
                      className="grid gap-4 p-5 transition hover:bg-slate-50 lg:grid-cols-[1.3fr_0.9fr_0.8fr_0.7fr_auto] lg:items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-950">{row.title || 'Calcul sans titre'}</p>
                        <p className="mt-1 text-sm text-slate-500">{row.client_name || 'Client non renseigne'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Statut</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">{statusLabels[row.opportunity_status ?? 'to_price']}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Prix</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{formatCurrency(Number(row.recommended_price ?? 0))}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Score</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{score}/100</p>
                      </div>
                      <ArrowUpRight className="text-slate-400" size={18} />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="font-semibold text-slate-950">Aucune opportunite pour le moment.</p>
                <p className="mt-2 text-sm text-slate-600">Creez un premier calcul pour alimenter votre pipeline.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function DashboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
