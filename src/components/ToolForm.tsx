'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Download, Lock, Sparkles } from 'lucide-react';
import { calculatePricing, type PricingInput } from '@/lib/pricing';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { CheckoutButton } from './CheckoutButton';

const PREMIUM_KEY = 'tarifly_premium';

const defaultInput: PricingInput = {
  activityType: 'service',
  productCost: 50,
  workHours: 3,
  hourlyRate: 45,
  fixedFees: 25,
  transactionFeesPercent: 2,
  desiredMarginPercent: 35,
  taxPercent: 20,
  competitorPrice: 0,
};

export function ToolForm() {
  const [input, setInput] = useState<PricingInput>(defaultInput);
  const [isPremium, setIsPremium] = useState(false);
  const result = useMemo(() => calculatePricing(input), [input]);

  useEffect(() => {
    setIsPremium(window.localStorage.getItem(PREMIUM_KEY) === 'true');
  }, []);

  function updateNumber(name: keyof PricingInput, value: string) {
    setInput((current) => ({
      ...current,
      [name]: Number(value),
    }));
  }

  function copySummary() {
    const content = isPremium
      ? buildPremiumExport()
      : `Prix recommandé : ${formatCurrency(result.priceIncludingTax)}. Marge estimée : ${formatPercent(
          result.marginRate,
        )}.`;
    navigator.clipboard.writeText(content);
    alert('Résultat copié.');
  }

  function buildPremiumExport() {
    return `Diagnostic Tarifly

Prix recommandé : ${formatCurrency(result.priceIncludingTax)}
Coût total estimé : ${formatCurrency(result.baseCost)}
Frais de paiement estimés : ${formatCurrency(result.transactionFees)}
Prix HT estimé : ${formatCurrency(result.priceExcludingTax)}
Taxe estimée : ${formatCurrency(result.taxAmount)}
Profit net estimé : ${formatCurrency(result.netProfit)}
Marge réelle : ${formatPercent(result.marginRate)}
Niveau de risque : ${result.riskLevel}

Diagnostic :
${result.diagnosis}

Justification client :
${result.clientJustification}

Checklist :
${result.checklist.map((item) => `- ${item}`).join('\n')}`;
  }

  function downloadExport() {
    const blob = new Blob([buildPremiumExport()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagnostic-tarifly.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <Sparkles size={18} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Calculateur de prix rentable</h1>
            <p className="text-sm text-slate-500">Renseignez vos coûts. Tarifly calcule un prix défendable.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Type d'activité</span>
            <select
              value={input.activityType}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  activityType: event.target.value as PricingInput['activityType'],
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <option value="service">Service</option>
              <option value="product">Produit</option>
              <option value="mixed">Mixte</option>
            </select>
          </label>

          <NumberField
            label="Coût matière / achat (€)"
            value={input.productCost}
            onChange={(value) => updateNumber('productCost', value)}
          />
          <NumberField label="Temps de travail (heures)" value={input.workHours} onChange={(value) => updateNumber('workHours', value)} />
          <NumberField label="Valeur horaire souhaitée (€)" value={input.hourlyRate} onChange={(value) => updateNumber('hourlyRate', value)} />
          <NumberField label="Frais fixes à intégrer (€)" value={input.fixedFees} onChange={(value) => updateNumber('fixedFees', value)} />
          <NumberField
            label="Frais paiement / plateforme (%)"
            value={input.transactionFeesPercent}
            onChange={(value) => updateNumber('transactionFeesPercent', value)}
          />
          <NumberField
            label="Marge cible (%)"
            value={input.desiredMarginPercent}
            onChange={(value) => updateNumber('desiredMarginPercent', value)}
          />
          <NumberField label="TVA / taxe (%)" value={input.taxPercent} onChange={(value) => updateNumber('taxPercent', value)} />
          <NumberField
            label="Prix concurrent optionnel (€)"
            value={input.competitorPrice}
            onChange={(value) => updateNumber('competitorPrice', value)}
          />
        </div>
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-soft md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-100">Résultat</p>
        <div className="mt-5">
          <p className="text-sm text-slate-300">Prix recommandé</p>
          <p className="mt-1 text-5xl font-bold tracking-tight">{formatCurrency(result.priceIncludingTax)}</p>
        </div>

        <div className="mt-6 grid gap-3 text-sm">
          <Metric label="Coût total estimé" value={formatCurrency(result.baseCost)} />
          <Metric label="Profit net estimé" value={isPremium ? formatCurrency(result.netProfit) : 'Premium'} locked={!isPremium} />
          <Metric label="Marge réelle" value={isPremium ? formatPercent(result.marginRate) : 'Premium'} locked={!isPremium} />
          <Metric label="Niveau de risque" value={isPremium ? result.riskLevel : 'Premium'} locked={!isPremium} />
        </div>

        {isPremium ? (
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="font-semibold">Diagnostic</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{result.diagnosis}</p>
            <p className="mt-4 font-semibold">Justification client</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{result.clientJustification}</p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="flex items-center gap-2 font-semibold">
              <Lock size={16} />
              Analyse complète verrouillée
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              La version gratuite affiche le prix recommandé. Le premium débloque la marge, le risque, le diagnostic
              et l'export professionnel.
            </p>
            <CheckoutButton className="mt-4 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              Débloquer pour 9,90 €
            </CheckoutButton>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button onClick={copySummary} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">
            <Copy size={16} />
            Copier
          </button>
          <button
            onClick={isPremium ? downloadExport : undefined}
            disabled={!isPremium}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </aside>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
      />
    </label>
  );
}

function Metric({ label, value, locked }: { label: string; value: string; locked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
      <span className="text-slate-300">{label}</span>
      <span className="flex items-center gap-2 font-semibold">
        {locked ? <Lock size={14} /> : null}
        {value}
      </span>
    </div>
  );
}
