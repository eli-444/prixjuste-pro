'use client';

import { useMemo, useState } from 'react';
import { OpportunityPrintActions } from '@/components/OpportunityPrintActions';
import type { PricingInput } from '@/lib/pricing';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { showToast } from '@/lib/toast';
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
  const [logoUrl, setLogoUrl] = useState('');
  const [quoteNumber, setQuoteNumber] = useState(`DV-${quote.id.slice(0, 8).toUpperCase()}`);
  const [quoteDate, setQuoteDate] = useState(toDateInputValue(quote.createdAt));
  const [validUntil, setValidUntil] = useState(toDateInputValue(addDays(quote.createdAt, 30)));
  const [shareCapital, setShareCapital] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30% a la validation du devis.\nSolde a la livraison ou a la fin de mission.');
  const [notes, setNotes] = useState(
    "Les prix sont etablis sur les informations communiquees a la date du devis.\nToute demande supplementaire pourra faire l'objet d'un devis complementaire.",
  );
  const [clientLink, setClientLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const serviceLine = useMemo(() => buildServiceLine(quote.title, quote.input, quote.finalPrice), [quote]);
  const issuerName = quote.issuerLines[0] || 'Tarifly';
  const issuerDetails = quote.issuerLines.slice(1);

  async function generateClientLink() {
    setIsGeneratingLink(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Vous devez être connecté pour générer un lien client.');
      }

      const validityDays = Math.max(1, getDaysBetween(quoteDate, validUntil));
      const { data, error } = await supabase
        .from('quotes')
        .upsert(
          {
            user_id: user.id,
            calculation_id: quote.id,
            quote_number: quoteNumber,
            status: 'generated',
            company_snapshot: {
              account_type: quote.accountType,
              name: issuerName,
              lines: issuerDetails,
              share_capital: shareCapital,
            },
            client_snapshot: {
              name: quote.clientName,
            },
            items: [
              {
                description: serviceLine.title,
                quantity: serviceLine.quantity,
                unit: serviceLine.unitLabel,
                unitPriceExcludingTax: serviceLine.unitPriceExcludingTax,
                totalExcludingTax: quote.subtotalExcludingTax,
              },
            ],
            subtotal_excluding_tax: quote.subtotalExcludingTax,
            tax_percent: quote.taxRate,
            tax_amount: quote.taxAmount,
            total_including_tax: quote.finalPrice,
            validity_days: validityDays,
          },
          { onConflict: 'user_id,quote_number' },
        )
        .select('public_token')
        .single();

      if (error) {
        throw error;
      }

      const url = `${window.location.origin}/devis/${data.public_token}`;
      setClientLink(url);
      showToast('Lien client généré.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Impossible de générer le lien client.', 'error');
    } finally {
      setIsGeneratingLink(false);
    }
  }

  async function copyClientLink() {
    if (!clientLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(clientLink);
      showToast('Lien client copié.', 'success');
    } catch {
      showToast('Impossible de copier le lien automatiquement.', 'error');
    }
  }

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

      <div className="mx-auto max-w-[794px]">
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
            <button
              type="button"
              onClick={generateClientLink}
              disabled={isGeneratingLink}
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGeneratingLink ? 'Génération...' : 'Générer lien client'}
            </button>
            <OpportunityPrintActions />
          </div>
        </div>

        {clientLink ? (
          <div className="mb-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm print:hidden">
            <p className="text-sm font-black text-slate-950">Lien à envoyer au client</p>
            <p className="mt-1 truncate text-xs text-slate-500">{clientLink}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={clientLink} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                Ouvrir
              </a>
              <button type="button" onClick={copyClientLink} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700">
                Copier
              </button>
            </div>
          </div>
        ) : null}

        <article className="quote-sheet min-h-[1123px] bg-white p-10 text-[13px] text-slate-950 shadow-xl">
          <header className="grid grid-cols-[1fr_260px] gap-8">
            <section>
              <div className="flex h-20 w-36 items-center justify-start">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo du devis" className="max-h-20 max-w-36 object-contain" />
                ) : (
                  <div className="text-xs font-black uppercase tracking-wide text-slate-950">Logo</div>
                )}
              </div>
              <div className="mt-16 space-y-2 leading-5">
                <p className="font-black">{issuerName}</p>
                <InfoLines lines={issuerDetails} />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-600">Devis N° {quoteNumber}</h2>
              <p className="mt-2 text-sm font-semibold">Ville, le {formatDateInput(quoteDate)}</p>
            </section>
          </header>

          <section className="ml-auto mt-12 w-[330px] border border-slate-950 p-3 leading-5">
            <p className="font-black">{quote.clientName}</p>
            <p>Adresse</p>
            <p>Numéro de téléphone</p>
            <p>Email</p>
          </section>

          <section className="mt-16">
            <table className="w-full table-fixed border-collapse text-xs">
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
                  <Th>Unite</Th>
                  <Th>Quantite</Th>
                  <Th>Montant HT</Th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-brand-50">
                  <Td strong>{serviceLine.title}</Td>
                  <Td align="right">{formatCurrency(serviceLine.unitPriceExcludingTax)}</Td>
                  <Td align="center">{serviceLine.unitLabel}</Td>
                  <Td align="center">{serviceLine.quantity}</Td>
                  <Td align="right">{formatCurrency(quote.subtotalExcludingTax)}</Td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mt-10 grid grid-cols-[1fr_270px] gap-10">
            <div className="min-h-[145px] border border-slate-950 p-4">
              <p className="font-black">Modalites et conditions de reglement :</p>
              <BulletLines value={paymentTerms} compact />
              <p className="mt-6 font-black">Conditions et notes :</p>
              <BulletLines value={notes} compact />
            </div>

            <div>
              <div className="ml-auto w-full text-xs">
                <TotalRow label="Total HT" value={formatCurrency(quote.subtotalExcludingTax)} />
                <TotalRow label={`TVA ${quote.taxRate}%`} value={formatCurrency(quote.taxAmount)} />
                <TotalRow label="Total TTC" value={formatCurrency(quote.finalPrice)} strong />
              </div>

              <p className="mt-12 text-center text-xs">Offre valable jusqu'au {formatDateInput(validUntil)}</p>
              <p className="mt-4 text-center text-xs font-semibold">Signature / bon pour accord :</p>
              <div className="mt-3 h-24 border border-slate-950 bg-white" />
            </div>
          </section>

          <footer className="mt-20 text-center text-[10px] leading-5 text-slate-500">
            <p>{issuerName}{shareCapital ? ` - au capital de ${shareCapital} euros` : ''}</p>
            <p>N° Siret : {getSiret(quote.issuerLines) || '...'}</p>
          </footer>
        </article>
      </div>

      {isModalOpen ? (
        <QuoteSettingsModal
          quoteNumber={quoteNumber}
          logoUrl={logoUrl}
          quoteDate={quoteDate}
          validUntil={validUntil}
          shareCapital={shareCapital}
          paymentTerms={paymentTerms}
          notes={notes}
          onQuoteNumberChange={setQuoteNumber}
          onLogoUrlChange={setLogoUrl}
          onQuoteDateChange={setQuoteDate}
          onValidUntilChange={setValidUntil}
          onShareCapitalChange={setShareCapital}
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
  logoUrl,
  quoteDate,
  validUntil,
  shareCapital,
  paymentTerms,
  notes,
  onQuoteNumberChange,
  onLogoUrlChange,
  onQuoteDateChange,
  onValidUntilChange,
  onShareCapitalChange,
  onPaymentTermsChange,
  onNotesChange,
  onClose,
}: {
  quoteNumber: string;
  logoUrl: string;
  quoteDate: string;
  validUntil: string;
  shareCapital: string;
  paymentTerms: string;
  notes: string;
  onQuoteNumberChange: (value: string) => void;
  onLogoUrlChange: (value: string) => void;
  onQuoteDateChange: (value: string) => void;
  onValidUntilChange: (value: string) => void;
  onShareCapitalChange: (value: string) => void;
  onPaymentTermsChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onClose: () => void;
}) {
  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onLogoUrlChange(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/40 px-4 py-8 print:hidden">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Parametres du devis</h2>
          <button type="button" onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">
            Fermer
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-bold text-slate-950">Logo du devis</span>
            <div className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-[160px_1fr] md:items-center">
              <div className="flex h-24 w-40 items-center justify-center rounded-lg bg-slate-50">
                {logoUrl ? (
                  <img src={logoUrl} alt="Apercu du logo" className="max-h-24 max-w-40 object-contain" />
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Aucun logo</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-brand-900 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
              />
            </div>
          </label>
          <TextField label="Numéro du devis" value={quoteNumber} onChange={onQuoteNumberChange} />
          <TextField label="Date du devis" type="date" value={quoteDate} onChange={onQuoteDateChange} />
          <TextField label="Date limite" type="date" value={validUntil} onChange={onValidUntilChange} />
          <TextField label="Capital social (EUR)" value={shareCapital} onChange={onShareCapitalChange} />
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="border border-white/70 px-2 py-2 text-center font-black">{children}</th>;
}

function Td({
  children,
  align = 'left',
  strong,
}: {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  strong?: boolean;
}) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  return <td className={`border border-white px-2 py-2 ${alignClass} ${strong ? 'font-bold' : ''}`}>{children}</td>;
}

function InfoLines({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-1">
      {lines.map((line, index) => (
        <p key={`${line}-${index}`} className="whitespace-pre-line">
          {line}
        </p>
      ))}
    </div>
  );
}

function BulletLines({ value, compact }: { value: string; compact?: boolean }) {
  const lines = value.split('\n').map((line) => line.trim()).filter(Boolean);
  return (
    <ul className={`${compact ? 'mt-2' : ''} list-disc space-y-1 pl-4 text-xs leading-5`}>
      {lines.map((line, index) => (
        <li key={`${line}-${index}`}>{line}</li>
      ))}
    </ul>
  );
}

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`grid grid-cols-[1fr_120px] ${strong ? 'bg-brand-50 font-black' : 'bg-white'} border-b border-white`}>
      <span className="px-3 py-1 text-right">{label}</span>
      <span className="px-3 py-1 text-right">{value}</span>
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
    quantity: formatQuantity(quantity),
    unitLabel: input.billingMode === 'hourly' ? 'heures' : input.billingMode === 'daily' ? 'jours' : 'forfait',
    unitPriceExcludingTax,
  };
}

function getSiret(lines: string[]) {
  const line = lines.find((value) => value.toLowerCase().includes('siret'));
  return line?.replace(/siret\s*:\s*/i, '') ?? '';
}

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function getDaysBetween(startValue: string, endValue: string) {
  const start = new Date(startValue);
  const end = new Date(endValue);
  const diff = end.getTime() - start.getTime();

  if (!Number.isFinite(diff)) {
    return 30;
  }

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDateInput(value: string) {
  return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`)) : 'Date indisponible';
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace('.', ',');
}

