'use client';

import { useMemo, useState } from 'react';
import { Briefcase, CreditCard, FileText, PenLine, UserRound } from 'lucide-react';
import { OpportunityPrintActions } from '@/components/OpportunityPrintActions';
import type { PricingInput } from '@/lib/pricing';
import { formatCurrency } from '@/lib/utils';

type EditableOpportunityQuoteProps = {
  initialOpen: boolean;
  quote: {
    id: string;
    title: string;
    clientName: string;
    statusLabel: string;
    input: PricingInput;
    finalPrice: number;
    subtotalExcludingTax: number;
    taxAmount: number;
    taxRate: number;
    baseCost: number;
    netProfit: number;
    issuerLines: string[];
    holderName: string;
    accountType: 'personal' | 'business';
    createdAt: string;
  };
};

export function EditableOpportunityQuote({ initialOpen, quote }: EditableOpportunityQuoteProps) {
  const [isModalOpen, setIsModalOpen] = useState(initialOpen);
  const [quoteNumber, setQuoteNumber] = useState(`OP-${quote.id.slice(0, 8).toUpperCase()}`);
  const [quoteDate, setQuoteDate] = useState(toDateInputValue(quote.createdAt));
  const [validUntil, setValidUntil] = useState(toDateInputValue(addDays(quote.createdAt, 30)));
  const [paymentTerms, setPaymentTerms] = useState('30% a la validation du devis.\nSolde a la livraison ou a la fin de mission.');
  const [notes, setNotes] = useState(
    "Les prix sont etablis sur les informations communiquees a la date du devis.\nToute demande supplementaire pourra faire l'objet d'un devis complementaire.",
  );
  const serviceLine = useMemo(() => buildServiceLine(quote.title, quote.input, quote.finalPrice), [quote]);

  return (
    <div className="h-full overflow-auto bg-slate-200 p-4 md:p-6 print:block print:h-auto print:overflow-visible print:bg-white print:p-0">
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          header, aside, nav, .print\\:hidden { display: none !important; }
          main, section { overflow: visible !important; height: auto !important; }
          body { background: #ffffff !important; }
          .quote-sheet { width: 100% !important; min-height: auto !important; box-shadow: none !important; border: 0 !important; }
        }
      `}</style>

      <div className="mx-auto max-w-[980px]">
        <div className="mb-4 flex items-center justify-between gap-4 print:hidden">
          <h1 className="text-2xl font-bold tracking-tight">Devis</h1>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Modifier le devis
            </button>
            <OpportunityPrintActions />
          </div>
        </div>

        <article className="quote-sheet relative overflow-hidden rounded-[4px] border border-slate-300 bg-white p-8 shadow-xl md:p-10">
          <div className="absolute bottom-0 left-0 h-3 w-full bg-brand-700" />
          <div className="absolute bottom-0 right-0 h-20 w-20 border-b-[80px] border-l-[80px] border-b-brand-900 border-l-transparent" />

          <header className="grid gap-8 border-b border-slate-200 pb-8 md:grid-cols-[1fr_0.9fr]">
            <section>
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-700 text-2xl font-black text-white">
                  T
                </div>
                <div>
                  <p className="text-4xl font-black tracking-tight text-slate-950">{quote.issuerLines[0] || 'Tarifly'}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">Devis commercial</p>
                </div>
              </div>
              <InfoLines className="mt-6" lines={quote.issuerLines.slice(1)} />
            </section>

            <section className="md:text-right">
              <h2 className="text-6xl font-black tracking-tight text-slate-950">DEVIS</h2>
              <p className="mt-4 inline-flex rounded-full bg-brand-700 px-4 py-2 text-sm font-bold text-white">
                {quote.statusLabel}
              </p>
              <div className="mt-6 grid gap-3 text-sm md:justify-end">
                <HeaderMeta label="N devis" value={quoteNumber} />
                <HeaderMeta label="Date" value={formatDateInput(quoteDate)} />
                <HeaderMeta label="Valable jusqu'au" value={formatDateInput(validUntil)} accent />
              </div>
            </section>
          </header>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <DocumentBlock icon={<UserRound size={20} />} title="Client">
              <p className="text-lg font-bold text-slate-950">{quote.clientName}</p>
            </DocumentBlock>

            <DocumentBlock icon={<Briefcase size={20} />} title="Projet">
              <p className="text-lg font-bold text-slate-950">{quote.title}</p>
              <p className="mt-1 text-sm text-slate-600">{getBillingModeLabel(quote.input.billingMode)}</p>
            </DocumentBlock>
          </div>

          <div className="mt-8 overflow-hidden rounded-[6px] border border-slate-300">
            <div className="grid grid-cols-[minmax(0,1fr)_90px_150px_150px] bg-brand-700 text-sm font-bold uppercase text-white">
              <div className="px-5 py-4">Designation des prestations</div>
              <div className="border-l border-white/30 px-4 py-4 text-center">Qte</div>
              <div className="border-l border-white/30 px-4 py-4 text-right">Prix unitaire HT</div>
              <div className="border-l border-white/30 px-4 py-4 text-right">Total HT</div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_90px_150px_150px] text-sm">
              <div className="min-h-[76px] px-5 py-4">
                <p className="font-bold text-slate-950">{serviceLine.title}</p>
                <p className="mt-1 leading-6 text-slate-600">{serviceLine.description}</p>
              </div>
              <div className="flex items-center justify-center border-l border-slate-200 px-4 py-4 font-semibold">{serviceLine.quantity}</div>
              <div className="flex items-center justify-end border-l border-slate-200 px-4 py-4 font-semibold">{formatCurrency(serviceLine.unitPriceExcludingTax)}</div>
              <div className="flex items-center justify-end border-l border-slate-200 px-4 py-4 font-bold text-slate-950">{formatCurrency(quote.subtotalExcludingTax)}</div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_420px]">
            <div className="space-y-6">
              <DocumentBlock icon={<CreditCard size={20} />} title="Conditions de paiement">
                <BulletLines value={paymentTerms} />
              </DocumentBlock>

              <DocumentBlock icon={<FileText size={20} />} title="Conditions & notes">
                <BulletLines value={notes} />
              </DocumentBlock>
            </div>

            <div>
              <div className="overflow-hidden rounded-[6px] border border-slate-300 text-sm">
                <TotalRow label="Sous-total HT" value={formatCurrency(quote.subtotalExcludingTax)} />
                <TotalRow label={`TVA (${quote.taxRate}%)`} value={formatCurrency(quote.taxAmount)} />
                <TotalRow label="Couts directs" value={formatCurrency(quote.baseCost)} />
                <TotalRow label="Profit estime" value={formatCurrency(quote.netProfit)} />
                <div className="flex items-center justify-between bg-brand-700 px-5 py-4 text-xl font-black text-white">
                  <span>Total TTC</span>
                  <span>{formatCurrency(quote.finalPrice)}</span>
                </div>
              </div>

              <DocumentBlock className="mt-8" icon={<PenLine size={20} />} title="Signature & cachet">
                <p className="text-sm leading-6 text-slate-700">Bon pour accord, date et signature.</p>
                <div className="mt-4 h-24 rounded-[6px] border border-slate-300 bg-white" />
              </DocumentBlock>
            </div>
          </div>
        </article>
      </div>

      {isModalOpen ? (
        <QuoteSettingsModal
          quoteNumber={quoteNumber}
          quoteDate={quoteDate}
          validUntil={validUntil}
          paymentTerms={paymentTerms}
          notes={notes}
          onQuoteNumberChange={setQuoteNumber}
          onQuoteDateChange={setQuoteDate}
          onValidUntilChange={setValidUntil}
          onPaymentTermsChange={setPaymentTerms}
          onNotesChange={setNotes}
          onClose={() => setIsModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

function QuoteSettingsModal({
  quoteNumber,
  quoteDate,
  validUntil,
  paymentTerms,
  notes,
  onQuoteNumberChange,
  onQuoteDateChange,
  onValidUntilChange,
  onPaymentTermsChange,
  onNotesChange,
  onClose,
}: {
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  paymentTerms: string;
  notes: string;
  onQuoteNumberChange: (value: string) => void;
  onQuoteDateChange: (value: string) => void;
  onValidUntilChange: (value: string) => void;
  onPaymentTermsChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/40 px-4 py-8 print:hidden">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Parametres du devis</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">
            Fermer
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextField label="Numero du devis" value={quoteNumber} onChange={onQuoteNumberChange} />
          <TextField label="Date du devis" type="date" value={quoteDate} onChange={onQuoteDateChange} />
          <TextField label="Date limite" type="date" value={validUntil} onChange={onValidUntilChange} />
          <div />
          <TextArea label="Conditions de paiement" value={paymentTerms} onChange={onPaymentTermsChange} />
          <TextArea label="Conditions et notes" value={notes} onChange={onNotesChange} />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex w-full justify-center rounded-xl bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-600"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
}

function TextField({ label, type = 'text', value, onChange }: { label: string; type?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-950">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 md:col-span-2">
      <span className="text-sm font-bold text-slate-950">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
    </label>
  );
}

function DocumentBlock({
  icon,
  title,
  children,
  className = '',
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex items-center gap-3 border-b-2 border-brand-700 pb-2 text-brand-700">
        {icon}
        <h3 className="text-lg font-black uppercase">{title}</h3>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function HeaderMeta({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 text-left">
      <span className="font-black uppercase text-slate-950">{label}</span>
      <span className={`text-right font-bold ${accent ? 'text-brand-700' : 'text-slate-950'}`}>{value}</span>
    </div>
  );
}

function InfoLines({ lines, className = '' }: { lines: string[]; className?: string }) {
  return (
    <div className={`space-y-2 text-sm leading-6 text-slate-700 ${className}`}>
      {lines.map((line, index) => (
        <p key={`${line}-${index}`} className="whitespace-pre-line">
          {line}
        </p>
      ))}
    </div>
  );
}

function BulletLines({ value }: { value: string }) {
  const lines = value.split('\n').map((line) => line.trim()).filter(Boolean);

  return (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
      {lines.map((line, index) => (
        <li key={`${line}-${index}`}>{line}</li>
      ))}
    </ul>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
      <span className="font-semibold uppercase text-slate-700">{label}</span>
      <span className="font-bold text-slate-950">{value}</span>
    </div>
  );
}

function buildServiceLine(title: string, input: PricingInput, finalPrice: number) {
  const quantity = input.billingMode === 'fixed' ? 1 : Math.max(1, Number(input.workHours || 1));
  const unitPriceIncludingTax = input.billingMode === 'fixed' ? finalPrice : Number(input.hourlyRate || 0);
  const taxRate = Math.max(0, input.taxPercent || 0) / 100;
  const unitPriceExcludingTax = taxRate >= 1 ? unitPriceIncludingTax : unitPriceIncludingTax / (1 + taxRate);

  return {
    title,
    description: getBillingModeLabel(input.billingMode),
    quantity: formatQuantity(quantity),
    unitPriceExcludingTax,
  };
}

function getBillingModeLabel(mode: PricingInput['billingMode']) {
  if (mode === 'hourly') return "A l'heure";
  if (mode === 'daily') return 'Journee';
  return 'Prestation Global';
}

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function formatDateInput(value: string) {
  return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`)) : 'Date indisponible';
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace('.', ',');
}
