import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ArrowUpRight, KanbanSquare, Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DeleteOpportunityButton } from '@/components/DeleteOpportunityButton';
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

type OpportunitySearchParams = {
  q?: string;
  status?: string;
  sort?: string;
};

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams?: Promise<OpportunitySearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const query = String(params.q ?? '').trim().toLowerCase();
  const statusFilter = String(params.status ?? 'all');
  const sort = String(params.sort ?? 'recent');
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
  const filteredRows = sortOpportunityRows(
    rows.filter((row) => {
      const matchesStatus = statusFilter === 'all' || row.opportunity_status === statusFilter;
      const searchable = [row.title, row.client_name, row.next_action].filter(Boolean).join(' ').toLowerCase();
      const matchesQuery = !query || searchable.includes(query);
      return matchesStatus && matchesQuery;
    }),
    sort,
  );
  const openRows = rows.filter((row) => !['won', 'lost'].includes(row.opportunity_status ?? ''));
  const potentialRevenue = openRows.reduce((total, row) => total + Number(row.recommended_price ?? 0), 0);
  const averageMargin =
    rows.length > 0 ? rows.reduce((total, row) => total + Number(row.result?.marginRate ?? 0), 0) / rows.length : 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUpsDue = openRows.filter((row) => row.deadline && new Date(row.deadline).getTime() <= today.getTime()).length;

  async function deleteOpportunity(formData: FormData) {
    'use server';

    const id = String(formData.get('id') ?? '');
    if (!id) {
      return;
    }

    const actionSupabase = await createServerSupabaseClient();
    const {
      data: { user: actionUser },
    } = actionSupabase ? await actionSupabase.auth.getUser() : { data: { user: null } };

    if (!actionSupabase || !actionUser) {
      return;
    }

    await actionSupabase.from('pricing_calculations').delete().eq('id', id).eq('user_id', actionUser.id);
    revalidatePath('/opportunites');
  }

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
                Suivez vos prospects, appels d'offres et calculs sauvegardes avec une lecture orientée rentabilité.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <DashboardMetric label="Opportunites ouvertes" value={`${openRows.length}`} />
            <DashboardMetric label="Chiffre potentiel" value={formatCurrency(potentialRevenue)} />
            <DashboardMetric label="Marge moyenne" value={formatPercent(averageMargin)} />
            <DashboardMetric label="Relances a traiter" value={`${followUpsDue}`} />
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <KanbanSquare size={18} />
                </span>
                <div>
                  <h2 className="font-bold text-slate-950">Tableau commercial</h2>
                  <p className="text-sm text-slate-500">Prix recommande, marge, statut et prochaine action.</p>
                </div>
              </div>

              <form className="mt-5 grid gap-3 lg:grid-cols-[1fr_190px_190px_auto]">
                <label className="relative">
                  <span className="sr-only">Rechercher</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    name="q"
                    defaultValue={params.q ?? ''}
                    placeholder="Rechercher un client, un dossier, une action..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm"
                  />
                </label>
                <select name="status" defaultValue={statusFilter} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                  <option value="all">Tous les statuts</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <select name="sort" defaultValue={sort} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                  <option value="recent">Plus recents</option>
                  <option value="price">Prix le plus haut</option>
                  <option value="probability">Probabilite</option>
                  <option value="deadline">Deadline</option>
                </select>
                <button type="submit" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Filtrer
                </button>
              </form>
            </div>

            {filteredRows.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {filteredRows.map((row) => {
                  const score = getOpportunityScore({
                    marginRate: row.result?.marginRate ?? 0,
                    probability: row.probability ?? 0,
                    clientBudget: row.client_budget ?? 0,
                    recommendedPrice: Number(row.recommended_price ?? 0),
                  });

                  return (
                    <div
                      key={row.id}
                      className="grid gap-4 p-5 transition hover:bg-slate-50 lg:grid-cols-[1.3fr_0.9fr_0.8fr_0.7fr_auto_auto] lg:items-center"
                    >
                      <Link href={`/opportunites/${row.id}`} className="block">
                        <p className="font-bold text-slate-950">{row.title || 'Calcul sans titre'}</p>
                        <p className="mt-1 text-sm text-slate-500">{row.client_name || 'Client non renseigne'}</p>
                      </Link>
                      <Link href={`/opportunites/${row.id}`} className="block">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Statut</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">{statusLabels[row.opportunity_status ?? 'to_price']}</p>
                      </Link>
                      <Link href={`/opportunites/${row.id}`} className="block">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Prix</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{formatCurrency(Number(row.recommended_price ?? 0))}</p>
                      </Link>
                      <Link href={`/opportunites/${row.id}`} className="block">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Score</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{score}/100</p>
                      </Link>
                      <Link href={`/opportunites/${row.id}`} aria-label="Ouvrir l'opportunité">
                        <ArrowUpRight className="text-slate-400" size={18} />
                      </Link>
                      <form action={deleteOpportunity}>
                        <input type="hidden" name="id" value={row.id} />
                        <DeleteOpportunityButton />
                      </form>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="font-semibold text-slate-950">Aucune opportunité trouvée.</p>
                <p className="mt-2 text-sm text-slate-600">Ajustez les filtres ou sauvegardez un nouveau calcul.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function sortOpportunityRows(rows: CalculationRow[], sort: string) {
  return [...rows].sort((a, b) => {
    if (sort === 'price') {
      return Number(b.recommended_price ?? 0) - Number(a.recommended_price ?? 0);
    }

    if (sort === 'probability') {
      return Number(b.probability ?? 0) - Number(a.probability ?? 0);
    }

    if (sort === 'deadline') {
      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      return aDeadline - bDeadline;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function DashboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

