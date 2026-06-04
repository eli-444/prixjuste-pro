import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProspectStatusControl } from '@/components/ProspectStatusControl';
import { statusLabels, type OpportunityStatus } from '@/lib/opportunities';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';

type ProspectRow = {
  id: string;
  title: string | null;
  client_name: string | null;
  opportunity_status: OpportunityStatus | null;
  recommended_price: number | null;
  quote_validated: boolean | null;
  quote_validated_at: string | null;
  created_at: string;
};

export default async function DashboardProspectFollowUpPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user || !supabase) {
    redirect('/connexion?redirect=/dashboard/suivi-demarches');
  }

  const { data } = await supabase
    .from('pricing_calculations')
    .select('id, title, client_name, opportunity_status, recommended_price, quote_validated, quote_validated_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const rows = (data ?? []) as ProspectRow[];

  return (
    <div className="h-full overflow-auto p-4 md:p-5">
      <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Suivi démarches</h1>
          <p className="mt-1 text-sm text-slate-500">Décidez uniquement après le retour client.</p>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {rows.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {rows.map((row) => {
              const status = row.opportunity_status ?? 'to_price';
              const isAccepted = status === 'won';
              const isRefused = status === 'lost';

              return (
                <div key={row.id} className="grid gap-4 p-4 text-sm transition hover:bg-slate-50 lg:grid-cols-[1.4fr_160px_150px_190px] lg:items-center">
                  <div className="min-w-0">
                    <Link href={`/opportunites/${row.id}`} className="font-black text-slate-950 hover:text-brand-600">
                      {row.title || 'Calcul sans titre'}
                    </Link>
                    <p className="mt-1 text-slate-500">{row.client_name || 'Client non renseigné'}</p>
                  </div>

                  <p className="font-bold text-slate-950">{formatCurrency(Number(row.recommended_price ?? 0))}</p>

                  <p className="text-sm font-semibold text-slate-600">{isAccepted || isRefused ? statusLabels[status] : 'En attente'}</p>

                  <div className="lg:justify-self-end">
                    {isAccepted ? <FinalStatusBadge label="Accepté" tone="green" /> : null}
                    {isRefused ? <FinalStatusBadge label="Refusé" tone="red" /> : null}
                    {!isAccepted && !isRefused ? <ProspectStatusControl calculationId={row.id} /> : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-sm text-slate-500">Aucune démarche à suivre pour le moment.</div>
        )}
      </div>
    </div>
  );
}

function FinalStatusBadge({ label, tone }: { label: string; tone: 'green' | 'red' }) {
  const classes =
    tone === 'green'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-red-200 bg-red-50 text-red-700';

  return (
    <span className={`inline-flex min-w-28 justify-center rounded-full border px-3 py-2 text-sm font-black ${classes}`}>
      {label}
    </span>
  );
}

