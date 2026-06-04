import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { PublicQuoteActions } from '@/components/PublicQuoteActions';
import { PublicQuoteSignatureCanvas } from '@/components/PublicQuoteSignatureCanvas';
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
  share_capital?: string;
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
  client_acceptance: { signature?: string } | null;
  company_snapshot: Snapshot | null;
  client_snapshot: Snapshot | null;
  items: QuoteItem[] | null;
  subtotal_excluding_tax: number | null;
  tax_percent: number | null;
  tax_amount: number | null;
  total_including_tax: number | null;
  validity_days: number | null;
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
    .select('public_token, quote_number, status, client_acceptance, company_snapshot, client_snapshot, items, subtotal_excluding_tax, tax_percent, tax_amount, total_including_tax, validity_days, generated_at, created_at')
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
  const locked = expired || status === 'expired' || status === 'accepted' || status === 'refused';
  const savedSignature = typeof quote.client_acceptance?.signature === 'string' ? quote.client_acceptance.signature : '';

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-73px)] bg-[#eef4f8] text-slate-950 print:bg-white">
        <style>{`
          @page { size: A4; margin: 10mm; }
          @media print {
            header, .print\\:hidden { display: none !important; }
            main { min-height: auto !important; background: #ffffff !important; }
            .quote-sheet { width: 100% !important; min-height: auto !important; box-shadow: none !important; border: 0 !important; border-radius: 0 !important; }
          }
        `}</style>

        <section className="print:hidden mx-auto grid max-w-6xl gap-5 px-4 py-8 lg:grid-cols-[1fr_470px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight md:text-4xl">Devis {quote.quote_number}</h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Proposition envoyée par {company.name || 'l’entreprise émettrice'} à {client.name || 'son client'}.
                </p>
              </div>
              <StatusBadge status={expired ? 'expired' : status} />
            </div>
          </div>

          <aside>
            <PublicQuoteActions token={token} status={expired ? 'expired' : status} isExpired={expired} />
          </aside>
        </section>

        <section id="devis" className="mx-auto max-w-[850px] px-4 pb-10 print:max-w-none print:px-0 print:pb-0">
          <article className="quote-sheet min-h-[1123px] bg-white p-8 text-[13px] text-slate-950 shadow-xl md:p-10 print:min-h-0 print:p-0">
            <header className="grid gap-8 md:grid-cols-[1fr_280px]">
              <section>
                <div className="flex h-20 w-36 items-center justify-start">
                  <div className="text-xs font-black uppercase tracking-wide text-slate-950">Logo</div>
                </div>
                <div className="mt-12 space-y-1 leading-5">
                  <p className="font-black">{company.name || firstLine(company.lines) || 'Émetteur'}</p>
                  <InfoLines lines={issuerLines(company)} />
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black text-brand-600">Devis N° {quote.quote_number}</h2>
                <p className="mt-2 text-sm font-semibold">Ville, le {formatDate(new Date(quote.generated_at ?? quote.created_at))}</p>
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <InfoRow label="Statut" value={statusLabel(expired ? 'expired' : status)} />
                  <InfoRow label="Valable jusqu'au" value={formatDate(expiresAt)} />
                </div>
              </section>
            </header>

            <section className="ml-auto mt-10 w-full border border-slate-950 p-3 leading-5 md:w-[330px]">
              <p className="font-black">{client.name || 'Client non renseigné'}</p>
              {client.address ? <p className="whitespace-pre-line">{client.address}</p> : <p>Adresse non renseignée</p>}
              {client.phone ? <p>{client.phone}</p> : null}
              {client.email ? <p>{client.email}</p> : null}
            </section>

            <section className="mt-14 overflow-x-auto">
              <table className="w-full min-w-[680px] table-fixed border-collapse text-xs">
                <colgroup>
                  <col className="w-[38%]" />
                  <col className="w-[19%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <thead>
                  <tr className="bg-brand-600 text-white">
                    <Th>Description</Th>
                    <Th>Prix unitaire HT</Th>
                    <Th>Unité</Th>
                    <Th>Quantité</Th>
                    <Th>Montant HT</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <tr key={`${item.description}-${index}`} className="border-b border-slate-200 bg-brand-50/70">
                        <Td strong>{item.description || 'Prestation'}</Td>
                        <Td align="right">{formatCurrency(Number(item.unitPriceExcludingTax ?? 0))}</Td>
                        <Td align="center">{item.unit || 'forfait'}</Td>
                        <Td align="center">{formatNumber(Number(item.quantity ?? 1))}</Td>
                        <Td align="right">{formatCurrency(Number(item.totalExcludingTax ?? 0))}</Td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-slate-200 bg-brand-50/70">
                      <Td strong>Prestation</Td>
                      <Td align="right">{formatCurrency(0)}</Td>
                      <Td align="center">forfait</Td>
                      <Td align="center">1</Td>
                      <Td align="right">{formatCurrency(0)}</Td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="mt-10 grid gap-8 md:grid-cols-[1fr_280px]">
              <div className="min-h-[150px] border border-slate-950 p-4">
                <p className="font-black">Modalités et conditions de règlement :</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5">
                  <li>Offre valable jusqu'au {formatDate(expiresAt)}.</li>
                  <li>Le règlement intervient selon les conditions convenues entre les parties.</li>
                  <li>Toute demande supplémentaire pourra faire l'objet d'un devis complémentaire.</li>
                </ul>
              </div>

              <div>
                <div className="w-full text-xs">
                  <TotalRow label="Total HT" value={formatCurrency(Number(quote.subtotal_excluding_tax ?? 0))} />
                  <TotalRow label={`TVA ${formatNumber(Number(quote.tax_percent ?? 0))}%`} value={formatCurrency(Number(quote.tax_amount ?? 0))} />
                  <TotalRow label="Total TTC" value={formatCurrency(Number(quote.total_including_tax ?? 0))} strong />
                </div>

                <p className="mt-10 text-center text-xs font-semibold">Signature / bon pour accord :</p>
                <div className="mt-3">
                  <PublicQuoteSignatureCanvas token={token} disabled={locked} initialSignature={savedSignature} />
                </div>
              </div>
            </section>

            <footer className="mt-16 text-center text-[10px] leading-5 text-slate-500">
              <p>
                {company.name || firstLine(company.lines) || 'Entreprise'}
                {company.share_capital ? ` - au capital de ${company.share_capital} euros` : ''}
              </p>
              <p>N° Siret : {company.siret || getSiret(company.lines) || '...'}</p>
            </footer>
          </article>
        </section>
      </main>
    </>
  );
}

function StatusBadge({ status }: { status: QuoteStatus }) {
  const tone =
    status === 'accepted'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === 'refused' || status === 'expired'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-amber-200 bg-amber-50 text-amber-700';

  return <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-black ${tone}`}>{statusLabel(status)}</span>;
}

function statusLabel(status: QuoteStatus) {
  const labels: Record<QuoteStatus, string> = {
    draft: 'Brouillon',
    generated: 'En attente',
    sent: 'Envoyé',
    accepted: 'Accepté',
    refused: 'Refusé',
    expired: 'Expiré',
  };

  return labels[status];
}

function issuerLines(company: Snapshot) {
  const lines = [...(company.lines ?? [])];

  if (company.address) {
    lines.push(company.address);
  }

  if (company.phone) {
    lines.push(company.phone);
  }

  if (company.email) {
    lines.push(company.email);
  }

  if (company.siret) {
    lines.push(`SIRET : ${company.siret}`);
  }

  return lines.filter((line, index) => line && index !== 0);
}

function InfoLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-right font-black text-slate-950">{value}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-3 text-left text-[11px] font-black uppercase tracking-[0.12em]">{children}</th>;
}

function Td({ children, align = 'left', strong }: { children: React.ReactNode; align?: 'left' | 'center' | 'right'; strong?: boolean }) {
  return <td className={`px-3 py-3 ${alignClasses[align]} ${strong ? 'font-black text-slate-950' : 'text-slate-700'}`}>{children}</td>;
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 border border-slate-200 px-4 py-3 ${strong ? 'bg-brand-600 text-white' : 'bg-white text-slate-700'}`}>
      <span className="font-bold">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}

function firstLine(lines?: string[]) {
  return Array.isArray(lines) ? lines.find(Boolean) : '';
}

function getSiret(lines?: string[]) {
  const match = lines?.find((line) => line.toLowerCase().includes('siret'));
  return match?.replace(/siret\s*:/i, '').trim() ?? '';
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
}
