'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Download, Gauge, LayoutDashboard, Lock, Save, ShieldCheck, Sparkles } from 'lucide-react';
import { calculatePricing, type PricingInput } from '@/lib/pricing';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { createTariflyPdf } from '@/lib/pdf';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { getSupabaseConfig } from '@/lib/supabase/env';
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
  const [premiumStatus, setPremiumStatus] = useState<'loading' | 'free' | 'premium'>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const result = useMemo(() => calculatePricing(input), [input]);

  useEffect(() => {
    let isMounted = true;

    async function loadAccountState() {
      const cachedPremium = window.localStorage.getItem(PREMIUM_KEY) === 'true';
      setIsPremium(cachedPremium);

      if (!getSupabaseConfig().isConfigured) {
        setPremiumStatus(cachedPremium ? 'premium' : 'free');
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted || !user) {
          setPremiumStatus(cachedPremium ? 'premium' : 'free');
          return;
        }

        setUserId(user.id);

        const { data: entitlement } = await supabase
          .from('premium_entitlements')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (entitlement) {
          setIsPremium(true);
          setPremiumStatus('premium');
          window.localStorage.setItem(PREMIUM_KEY, 'true');
        } else {
          setIsPremium(false);
          setPremiumStatus('free');
          window.localStorage.removeItem(PREMIUM_KEY);
        }
      } catch {
        setPremiumStatus(cachedPremium ? 'premium' : 'free');
        // The calculator stays usable even if account services are temporarily unavailable.
      }
    }

    loadAccountState();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateNumber(name: keyof PricingInput, value: string) {
    setInput((current) => ({
      ...current,
      [name]: Number(value),
    }));
  }

  async function saveCalculation() {
    setSaveStatus('');

    if (!getSupabaseConfig().isConfigured) {
      setSaveStatus('La sauvegarde est momentanement indisponible.');
      return;
    }

    if (!userId) {
      window.location.href = '/connexion?redirect=/outil';
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.from('pricing_calculations').insert({
        user_id: userId,
        activity_type: input.activityType,
        input,
        result,
        recommended_price: result.priceIncludingTax,
      });

      if (error) {
        throw error;
      }

      setSaveStatus('Calcul sauvegarde dans votre compte.');
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : 'Sauvegarde impossible pour le moment.');
    }
  }

  function copySummary() {
    const content = isPremium
      ? buildPremiumExport()
      : `Prix recommande : ${formatCurrency(result.priceIncludingTax)}. Marge estimee : ${formatPercent(
          result.marginRate,
        )}.`;
    navigator.clipboard.writeText(content);
    alert('Resultat copie.');
  }

  function buildPremiumExport() {
    return `Diagnostic Tarifly

Prix recommande : ${formatCurrency(result.priceIncludingTax)}
Cout total estime : ${formatCurrency(result.baseCost)}
Frais de paiement estimes : ${formatCurrency(result.transactionFees)}
Prix HT estime : ${formatCurrency(result.priceExcludingTax)}
Taxe estimee : ${formatCurrency(result.taxAmount)}
Profit net estime : ${formatCurrency(result.netProfit)}
Marge reelle : ${formatPercent(result.marginRate)}
Niveau de risque : ${result.riskLevel}

Diagnostic :
${result.diagnosis}

Justification client :
${result.clientJustification}

Checklist :
${result.checklist.map((item) => `- ${item}`).join('\n')}`;
  }

  async function downloadExport() {
    const blob = await createTariflyPdf({
      title: 'Rapport de rentabilite',
      generatedAt: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date()),
      metrics: [
        { label: 'Prix recommande TTC', value: formatCurrency(result.priceIncludingTax) },
        { label: 'Prix hors taxes estime', value: formatCurrency(result.priceExcludingTax) },
        { label: 'Profit net estime', value: formatCurrency(result.netProfit) },
        { label: 'Marge reelle', value: formatPercent(result.marginRate) },
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
    link.download = 'diagnostic-tarifly.pdf';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_390px]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft lg:sticky lg:top-32 lg:self-start">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <LayoutDashboard size={18} />
          </span>
          <div>
            <p className="font-bold text-slate-950">Workspace</p>
            <p className="text-xs text-slate-500">Calcul de prix</p>
          </div>
        </div>
        <div className="mt-6 grid gap-2 text-sm">
          <a href="#hypotheses" className="rounded-xl bg-slate-950 px-3 py-2 font-semibold text-white">
            Hypotheses
          </a>
          <a href="#rentabilite" className="rounded-xl px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100">
            Resultat
          </a>
          <a href="#exports" className="rounded-xl px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100">
            Exports
          </a>
        </div>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Statut</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-950">
            <ShieldCheck size={16} className={isPremium ? 'text-brand-600' : 'text-slate-400'} />
            {premiumStatus === 'loading' ? 'Verification...' : isPremium ? 'Premium actif' : 'Gratuit'}
          </p>
        </div>
      </aside>

      <div id="hypotheses" className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Sparkles size={18} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">Calculateur de prix rentable</h1>
              <p className="text-sm text-slate-500">Structurez vos couts, votre temps et votre marge cible.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Type d'activite</span>
              <select
                value={input.activityType}
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    activityType: event.target.value as PricingInput['activityType'],
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <option value="service">Service</option>
                <option value="product">Produit</option>
                <option value="mixed">Mixte</option>
              </select>
            </label>

            <NumberField label="Cout matiere / achat (EUR)" value={input.productCost} onChange={(value) => updateNumber('productCost', value)} />
            <NumberField label="Temps de travail (heures)" value={input.workHours} onChange={(value) => updateNumber('workHours', value)} />
            <NumberField label="Valeur horaire souhaitee (EUR)" value={input.hourlyRate} onChange={(value) => updateNumber('hourlyRate', value)} />
            <NumberField label="Frais fixes a integrer (EUR)" value={input.fixedFees} onChange={(value) => updateNumber('fixedFees', value)} />
            <NumberField label="Frais paiement / plateforme (%)" value={input.transactionFeesPercent} onChange={(value) => updateNumber('transactionFeesPercent', value)} />
            <NumberField label="Marge cible (%)" value={input.desiredMarginPercent} onChange={(value) => updateNumber('desiredMarginPercent', value)} />
            <NumberField label="TVA / taxe (%)" value={input.taxPercent} onChange={(value) => updateNumber('taxPercent', value)} />
            <NumberField label="Prix concurrent optionnel (EUR)" value={input.competitorPrice} onChange={(value) => updateNumber('competitorPrice', value)} />
          </div>
        </section>
      </div>

      <aside id="rentabilite" className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-soft md:p-8 lg:sticky lg:top-32 lg:self-start">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-100">Resultat</p>
        <div className="mt-5">
          <p className="text-sm text-slate-300">Prix recommande</p>
          <p className="mt-1 text-5xl font-bold tracking-tight">{formatCurrency(result.priceIncludingTax)}</p>
        </div>

        {premiumStatus === 'loading' ? (
          <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-200">
            Verification de votre acces premium en cours...
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 text-sm">
          <Metric label="Cout total estime" value={formatCurrency(result.baseCost)} />
          <Metric label="Profit net estime" value={isPremium ? formatCurrency(result.netProfit) : 'Premium'} locked={!isPremium} />
          <Metric label="Marge reelle" value={isPremium ? formatPercent(result.marginRate) : 'Premium'} locked={!isPremium} />
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
              Analyse complete verrouillee
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              La version gratuite affiche le prix recommande. Le premium debloque la marge, le risque, le diagnostic et
              l'export PDF professionnel.
            </p>
            <CheckoutButton className="mt-4 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              Demarrer Premium - 9,90 EUR / mois
            </CheckoutButton>
          </div>
        )}

        <div id="exports" className="mt-6 grid gap-3 sm:grid-cols-3">
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
            PDF
          </button>
          <button onClick={saveCalculation} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold">
            <Save size={16} />
            Sauver
          </button>
        </div>

        {saveStatus ? <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-200">{saveStatus}</p> : null}
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
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
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
