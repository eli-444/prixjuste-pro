import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { PublicQuoteActions } from '@/components/PublicQuoteActions';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getQuoteExpirationDate, isFinalQuoteStatus, isQuoteExpired } from '@/lib/quotes';
import { formatCurrency } from '@/lib/utils';

type QuoteStatus = 'draft' | 'generated' | 'sent' | 'accepted' | 'refused' | 'expired';

type Snapshot = {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
  siret?: string;
  lines?: string[];
};

type QuoteItem = {
  description?: string;
  quantity?: number;
  unit?: string;
  unitPriceExcludingTax?: number;
  totalExcludingTax?: number;
};

type PublicQuote = {
  public_token: string;
  quote_number: string;
  status: QuoteStatus | null;
  company_snapshot: Snapshot | null;
  client_snapshot: Snapshot | null;
  items: QuoteItem[] | null;
  subtotal_excluding_tax: number | null;
  tax_percent: number | null;
  tax_amount: number | null;
  total_including_tax: number | null;
  validity_days: number | null;
  deposit_status: string | null;
  generated_at: string | null;
  created_at: string;
};

export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    notFound();
  }

  const { data } = await supabase
    .from('quotes')
    .select('public_token, quote_number, status, company_snapshot, client_snapshot, items, subtotal_excluding_tax, tax_percent, tax_amount, total_including_tax, validity_days, deposit_status, generated_at, created_at')
    .eq('public_token', token)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const quote = data as PublicQuote;
  const company = (quote.company_snapshot ?? {}) as Snapshot;
  const client = (quote.client_snapshot ?? {}) as Snapshot;
  const items = Array.isArray(quote.items) ? quote.items : [];
  const status = quote.status ?? 'generated';
  const expiresAt = getQuoteExpirationDate(quote.generated_at ?? quote.created_at, quote.validity_days);
  const expired = !isFinalQuoteStatus(status) && isQuoteExpired(quote.generated_at ?? quote.created_at, quote.validity_days);

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-73px)] bg-[#f4f8fb] text-slate-950">
        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Devis client</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Devis {quote.quote_number}</h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Proposition envoyée par {company.name || 'l’entreprise émettrice'} à {client.name || 'son client'}.
                </p>
              </div>
              <StatusBadge status={expired ? 'expired' : status} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <InfoCard label="Émetteur" value={company.name || 'Non renseigné'} detail={company.email || company.phone || ''} />
              <InfoCard label="Client" value={client.name || 'Non renseigné'} detail={client.email || ''} />
              <InfoCard label="Validité" value={formatDate(expiresAt)} detail={`${quote.validity_days ?? 30} jours`} />
            </div>
          </div>

          <aside className="space-y-4">
            <PublicQuoteActions token={token} status={expired ? 'expired' : status} isExpired={expired} />
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-brand-700"
            >
              Découvrir Tarifly
            </Link>
          </aside>
        </section>

        <section id="devis" className="mx-auto max-w-6xl px-4 pb-10">
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <header className="grid gap-6 border-b border-slate-200 p-6 md:grid-cols-2 md:p-8">
              <AddressBlock title="Émetteur" data={company} />
              <AddressBlock title="Client" data={client} />
            </header>

            <div className="overflow-x-auto p-4 md:p-8">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="bg-brand-600 text-white">
                    <Th>Désignation</Th>
                    <Th align="right">Prix unitaire HT</Th>
                    <Th align="center">Unité</Th>
                    <Th align="center">Quantité</Th>
                    <Th align="right">Montant HT</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <tr key={`${item.description}-${index}`} className="border-b border-slate-200">
                        <Td>{item.description || 'Prestation'}</Td>
                        <Td align="right">{formatCurrency(Number(item.unitPriceExcludingTax ?? 0))}</Td>
                        <Td align="center">{item.unit || 'forfait'}</Td>
                        <Td align="center">{formatNumber(Number(item.quantity ?? 1))}</Td>
                        <Td align="right">{formatCurrency(Number(item.totalExcludingTax ?? 0))}</Td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <Td>Aucune ligne renseignée</Td>
                      <Td align="right">{formatCurrency(0)}</Td>
                      <Td align="center">-</Td>
                      <Td align="center">-</Td>
                      <Td align="right">{formatCurrency(0)}</Td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="mt-6 ml-auto w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 text-sm">
                <TotalRow label="Total HT" value={formatCurrency(Number(quote.subtotal_excluding_tax ?? 0))} />
                <TotalRow label={`TVA ${formatNumber(Number(quote.tax_percent ?? 0))}%`} value={formatCurrency(Number(quote.tax_amount ?? 0))} />
                <TotalRow label="Total TTC" value={formatCurrency(Number(quote.total_including_tax ?? 0))} strong />
              </div>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}

function StatusBadge({ status }: { status: QuoteStatus }) {
  const labels: Record<QuoteStatus, string> = {
    draft: 'Brouillon',
    generated: 'En attente',
    sent: 'Envoyé',
    accepted: 'Accepté',
    refused: 'Refusé',
    expired: 'Expiré',
  };
  const tone =
    status === 'accepted'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === 'refused' || status === 'expired'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-amber-200 bg-amber-50 text-amber-700';

  return <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-black ${tone}`}>{labels[status]}</span>;
}

function InfoCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 font-black text-slate-950">{value}</p>
      {detail ? <p className="mt-1 truncate text-sm text-slate-500">{detail}</p> : null}
    </div>
  );
}

function AddressBlock({ title, data }: { title: string; data: Snapshot }) {
  return (
    <section className="rounded-2xl bg-slate-50 p-5">
      <h2 className="text-sm font-black uppercase tracking-[0.14em] text-brand-600">{title}</h2>
      <div className="mt-3 space-y-1 text-sm leading-6 text-slate-700">
        <p className="font-black text-slate-950">{data.name || 'Non renseigné'}</p>
        {data.address ? <p className="whitespace-pre-line">{data.address}</p> : null}
        {Array.isArray(data.lines) ? data.lines.map((line) => (line ? <p key={line}>{line}</p> : null)) : null}
        {data.siret ? <p>SIRET {data.siret}</p> : null}
        {data.email ? <p>{data.email}</p> : null}
        {data.phone ? <p>{data.phone}</p> : null}
      </div>
    </section>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'center' | 'right' }) {
  return <th className={`px-4 py-3 text-xs font-black uppercase tracking-[0.12em] ${alignClasses[align]}`}>{children}</th>;
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'center' | 'right' }) {
  return <td className={`px-4 py-4 text-slate-700 ${alignClasses[align]}`}>{children}</td>;
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-3 ${strong ? 'bg-brand-600 text-white' : 'border-b border-slate-200 bg-white text-slate-700'}`}>
      <span className="font-bold">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
}
