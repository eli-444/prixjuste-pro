'use client';

import Link from 'next/link';
import { Download, RotateCcw } from 'lucide-react';
import { createTariflyPdf } from '@/lib/pdf';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { PricingResult } from '@/lib/pricing';

export function SavedCalculationActions({
  calculationId,
  title,
  result,
}: {
  calculationId: string;
  title: string;
  result: PricingResult;
}) {
  async function downloadPdf() {
    const blob = await createTariflyPdf({
      title: title || 'Rapport de rentabilité',
      generatedAt: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date()),
      metrics: [
        { label: 'Prix recommande TTC', value: formatCurrency(result.priceIncludingTax) },
        { label: 'Prix hors taxes estime', value: formatCurrency(result.priceExcludingTax) },
        { label: 'Profit net estime', value: formatCurrency(result.netProfit) },
        { label: 'Marge réelle', value: formatPercent(result.marginRate) },
        { label: 'Cout total estime', value: formatCurrency(result.baseCost) },
        { label: 'Niveau de risque', value: result.riskLevel },
      ],
      sections: [
        { title: 'Diagnostic', body: result.diagnosis },
        { title: 'Justification client', body: result.clientJustification },
        { title: 'Checklist avant envoi', body: result.checklist },
      ],
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slugify(title || 'diagnostic-tarifly')}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href={`/outil?calculation=${calculationId}`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <RotateCcw size={16} />
        Rouvrir le calculateur
      </Link>
      <button
        type="button"
        onClick={downloadPdf}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
      >
        <Download size={16} />
        Télécharger le PDF
      </button>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

