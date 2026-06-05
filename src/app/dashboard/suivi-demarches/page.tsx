import Link from 'next/link';

import type { OpportunityStatus } from '@/lib/opportunities';
import { getQuoteExpirationDate, isFinalQuoteStatus, isQuoteExpired } from '@/lib/quotes';
import { requireActivePremium } from '@/lib/premium/server';
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

type StatusTone = 'slate' | 'amber' | 'green' | 'red';

export default async function SuiviDemarchesPage() {
  const { supabase, user } = await requireActivePremium({ loginRedirect: '/dashboard/suivi-demarches' });

  const [prospectsResult, quotesResult, notificationsResult] = await Promise.all([
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
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  const prospectRows = (prospectsResult.data ?? []) as ProspectRow[];
  const quoteRows = (quotesResult.data ?? []) as QuoteRow[];
  const notificationRows = (notificationsResult.data ?? []) as NotificationRow[];

  const latestQuoteByCalculation = new Map<string, QuoteRow>();
  quoteRows.forEach((quote) => {
    if (!quote.calculation_id || latestQuoteByCalculation.has(quote.calculation_id)) {
      return;
    }

    latestQuoteByCalculation.set(quote.calculation_id, quote);
  });

  const notificationsByQuoteNumber = buildNotificationsByQuoteNumber(quoteRows, notificationRows);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-ink">Suivi démarches</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {prospectRows.length === 0 ? (
          <div className="p-6 text-sm font-semibold text-slate-500">Aucune démarche enregistrée.</div>
        ) : (
          prospectRows.map((row) => {
            const quote = latestQuoteByCalculation.get(row.id);
            const state = getClientQuoteState(quote);
            const quoteNotifications = quote ? notificationsByQuoteNumber.get(quote.quote_number) ?? [] : [];

            return (
              <div key={row.id} className="border-b border-slate-100 last:border-b-0">
                <div className="grid gap-4 p-4 text-sm transition hover:bg-slate-50 lg:grid-cols-[1.35fr_150px_180px_230px] lg:items-center">
                  <div className="min-w-0">
                    <Link
                      href={`/opportunites/${row.id}`}
                      className="block truncate text-base font-black text-ink hover:text-brand-700"
                    >
                      {row.title || 'Calcul sans titre'}
                    </Link>
                    <p className="mt-1 truncate text-slate-500">{row.client_name || 'Client non renseigné'}</p>
                  </div>

                  <p className="font-black text-ink">{formatCurrency(row.recommended_price ?? 0)}</p>

                  <FinalStatusBadge label={state.label} tone={state.tone} />

                  <div className="flex flex-col gap-2 lg:items-end">
                    {quote ? (
                      <>
                        <Link
                          href={`/devis/${quote.public_token}`}
                          target="_blank"
                          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-ink transition hover:border-brand-200 hover:text-brand-700"
                        >
                          Lien client
                        </Link>
                        {quoteNotifications.length > 0 ? (
                          <QuoteNotifications notifications={quoteNotifications} />
                        ) : null}
                      </>
                    ) : (
                      <span className="font-bold text-slate-400">Aucun devis</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function buildNotificationsByQuoteNumber(quotes: QuoteRow[], notifications: NotificationRow[]) {
  const notificationsByQuoteNumber = new Map<string, NotificationRow[]>();

  quotes.forEach((quote) => {
    const relatedNotifications = notifications.filter((notification) => {
      const content = `${notification.title} ${notification.message}`;
      return content.includes(quote.quote_number);
    });

    if (relatedNotifications.length > 0) {
      notificationsByQuoteNumber.set(quote.quote_number, relatedNotifications);
    }
  });

  return notificationsByQuoteNumber;
}

function QuoteNotifications({ notifications }: { notifications: NotificationRow[] }) {
  return (
    <details className="w-full max-w-[230px] rounded-xl border border-brand-100 bg-brand-50 text-brand-950">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand-700 marker:hidden">
        Notifications
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-brand-800">{notifications.length}</span>
      </summary>
      <div className="grid gap-3 border-t border-brand-100 px-3 py-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="text-xs leading-5">
            <p className="font-black text-ink">{notification.title}</p>
            <p className="mt-1 text-slate-600">{notification.message}</p>
            <p className="mt-1 font-bold text-brand-700">{formatDate(new Date(notification.created_at))}</p>
          </div>
        ))}
      </div>
    </details>
  );
}

function getClientQuoteState(quote?: QuoteRow): { label: string; tone: StatusTone } {
  if (!quote) {
    return { label: 'À générer', tone: 'slate' };
  }

  if (quote.status === 'accepted') {
    return { label: 'Accepté', tone: 'green' };
  }

  if (quote.status === 'refused') {
    return { label: 'Refusé', tone: 'red' };
  }

  const generatedAt = quote.generated_at ?? quote.created_at;
  const validityDays = quote.validity_days ?? 30;

  if (isFinalQuoteStatus(quote.status) || isQuoteExpired(generatedAt, validityDays)) {
    return { label: 'Expiré', tone: 'red' };
  }

  return {
    label: `En attente client · valable jusqu'au ${formatDate(getQuoteExpirationDate(generatedAt, validityDays))}`,
    tone: 'amber',
  };
}

function FinalStatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  const toneClasses = {
    slate: 'border-slate-200 bg-slate-50 text-slate-500',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    red: 'border-rose-200 bg-rose-50 text-rose-700',
  } satisfies Record<StatusTone, string>;

  return (
    <span
      className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-center text-sm font-black ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(value);
}
