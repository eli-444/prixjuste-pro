import Link from 'next/link';
import { redirect } from 'next/navigation';
import { type OpportunityStatus } from '@/lib/opportunities';
import { getQuoteExpirationDate, isFinalQuoteStatus, isQuoteExpired } from '@/lib/quotes';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';

type ProspectRow = {
  id: string;
  title: string | null;
  client_name: string | null;
  opportunity_status: OpportunityStatus | null;
  recommended_price: number | null;
  created_at: string;
};

type QuoteRow = {
  id: string;
  calculation_id: string | null;
  public_token: string;
  quote_number: string;
  status: 'draft' | 'generated' | 'sent' | 'accepted' | 'refused' | 'expired' | null;
  validity_days: number | null;
  generated_at: string | null;
  created_at: string;
};

type NotificationRow = {
  id: string;
  title: string;
  message: string;
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

  const [{ data: calculations }, { data: quotes }, { data: notifications }] = await Promise.all([
    supabase
      .from('pricing_calculations')
      .select('id, title, client_name, opportunity_status, recommended_price, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('quotes')
      .select('id, calculation_id, public_token, quote_number, status, validity_days, generated_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('app_notifications')
      .select('id, title, message, created_at')
      .eq('user_id', user.id)
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  const latestQuoteByCalculation = new Map<string, QuoteRow>();

  for (const quote of ((quotes ?? []) as QuoteRow[])) {
    if (quote.calculation_id && !latestQuoteByCalculation.has(quote.calculation_id)) {
      latestQuoteByCalculation.set(quote.calculation_id, quote);
    }
  }

  const rows = (calculations ?? []) as ProspectRow[];
  const notificationRows = (notifications ?? []) as NotificationRow[];

  return (
    <div className="h-full overflow-auto p-4 md:p-5">
      <header className="mb-4">
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Suivi démarches</h1>
        <p className="mt-1 text-sm text-slate-500">Les statuts se mettent à jour avec la réponse du client.</p>
      </header>

      {notificationRows.length > 0 ? (
        <div className="mb-4 grid gap-3">
          {notificationRows.map((notification) => (
            <div key={notification.id} className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
              <p className="font-black">{notification.title}</p>
              <p className="mt-1 text-brand-800">{notification.message}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {rows.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {rows.map((row) => {
              const quote = latestQuoteByCalculation.get(row.id);
              const quoteState = getClientQuoteState(quote);

              return (
                <div key={row.id} className="grid gap-4 p-4 text-sm transition hover:bg-slate-50 lg:grid-cols-[1.4fr_150px_170px_180px] lg:items-center">
                  <div className="min-w-0">
                    <Link href={`/opportunites/${row.id}`} className="font-black text-slate-950 hover:text-brand-600">
                      {row.title || 'Calcul sans titre'}
                    </Link>
                    <p className="mt-1 text-slate-500">{row.client_name || 'Client non renseigné'}</p>
                  </div>

                  <p className="font-bold text-slate-950">{formatCurrency(Number(row.recommended_price ?? 0))}</p>
                  <FinalStatusBadge label={quoteState.label} tone={quoteState.tone} />

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {quote ? (
                      <Link
                        href={`/devis/${quote.public_token}`}
                        target="_blank"
                        className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Lien client
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">Aucun devis</span>
                    )}
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

function getClientQuoteState(quote?: QuoteRow) {
  if (!quote) {
    return { label: 'À générer', tone: 'slate' as const };
  }

  const status = quote.status ?? 'generated';
  const expired = !isFinalQuoteStatus(status) && isQuoteExpired(quote.generated_at ?? quote.created_at, quote.validity_days);

  if (status === 'accepted') {
    return { label: 'Accepté', tone: 'green' as const };
  }

  if (status === 'refused') {
    return { label: 'Refusé', tone: 'red' as const };
  }

  if (status === 'expired' || expired) {
    return { label: 'Expiré', tone: 'red' as const };
  }

  return { label: `En attente client · valable jusqu'au ${formatDate(getQuoteExpirationDate(quote.generated_at ?? quote.created_at, quote.validity_days))}`, tone: 'amber' as const };
}

function FinalStatusBadge({ label, tone }: { label: string; tone: 'green' | 'red' | 'amber' | 'slate' }) {
  const classes = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-500',
  };

  return (
    <span className={`inline-flex justify-center rounded-full border px-3 py-2 text-sm font-black ${classes[tone]}`}>
      {label}
    </span>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(value);
}
