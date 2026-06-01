'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Download, Lock, Save, Sparkles } from 'lucide-react';
import { calculatePricing, type PricingInput } from '@/lib/pricing';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { createTariflyPdf } from '@/lib/pdf';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { getSupabaseConfig } from '@/lib/supabase/env';
import {
  defaultOpportunityMeta,
  statusLabels,
  type OpportunityMeta,
  type OpportunityStatus,
} from '@/lib/opportunities';
import {
  compareToMarket,
  defaultMarketBenchmark,
  findMarketRate,
  findMarketRateStat,
  franceRegions,
  marketUnitLabels,
  type MarketBenchmarkInput,
  type MarketRate,
  type MarketRateStat,
  type MarketUnit,
  type Profession,
} from '@/lib/market';
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

export function ToolForm({
  initialInput = defaultInput,
  initialMeta = defaultOpportunityMeta,
  initialMarket = defaultMarketBenchmark,
  professions = [],
  marketRates = [],
  marketRateStats = [],
}: {
  initialInput?: PricingInput;
  initialMeta?: OpportunityMeta;
  initialMarket?: MarketBenchmarkInput;
  professions?: Profession[];
  marketRates?: MarketRate[];
  marketRateStats?: MarketRateStat[];
}) {
  const [input, setInput] = useState<PricingInput>(initialInput);
  const [fields, setFields] = useState<Record<keyof Omit<PricingInput, 'activityType'>, string>>({
    productCost: String(initialInput.productCost),
    workHours: String(initialInput.workHours),
    hourlyRate: String(initialInput.hourlyRate),
    fixedFees: String(initialInput.fixedFees),
    transactionFeesPercent: String(initialInput.transactionFeesPercent),
    desiredMarginPercent: String(initialInput.desiredMarginPercent),
    taxPercent: String(initialInput.taxPercent),
    competitorPrice: String(initialInput.competitorPrice),
  });
  const [meta, setMeta] = useState<OpportunityMeta>(initialMeta);
  const [market, setMarket] = useState<MarketBenchmarkInput>(initialMarket);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<'loading' | 'free' | 'premium'>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const result = useMemo(() => calculatePricing(input), [input]);
  const autoMarketReferencePrice = getAutoMarketReferencePrice(market.unit, input, result);
  const marketReferencePrice =
    market.referenceMode === 'manual' ? Number(market.manualPrice || autoMarketReferencePrice) : autoMarketReferencePrice;
  const matchingMarketRate = useMemo(() => findMarketRate(marketRates, market), [marketRates, market]);
  const matchingMarketStat = useMemo(() => findMarketRateStat(marketRateStats, market), [marketRateStats, market]);
  const marketComparison = compareToMarket(marketReferencePrice, matchingMarketRate);

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
    if (name === 'activityType') {
      return;
    }

    setFields((current) => ({
      ...current,
      [name]: value,
    }));

    setInput((current) => ({
      ...current,
      [name]: value === '' ? 0 : Number(value),
    }));
  }

  function updateMeta<K extends keyof OpportunityMeta>(name: K, value: OpportunityMeta[K]) {
    setMeta((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateMarket<K extends keyof MarketBenchmarkInput>(name: K, value: MarketBenchmarkInput[K]) {
    setMarket((current) => ({
      ...current,
      [name]: value,
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
        title: meta.title || 'Calcul sans titre',
        client_name: meta.clientName || null,
        opportunity_status: meta.status,
        probability: meta.probability,
        deadline: meta.deadline || null,
        client_budget: meta.clientBudget || null,
        next_action: meta.nextAction || null,
        quote_validated: meta.quoteValidated,
        quote_validated_at: meta.quoteValidated ? new Date().toISOString() : null,
        market_profession_slug: market.professionSlug || null,
        market_region: market.region || null,
        market_city: market.city || null,
        market_unit: market.unit,
        market_reference_price: marketReferencePrice || null,
        market_snapshot: matchingMarketRate ?? null,
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
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
      <div id="hypotheses" className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Sparkles size={18} />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">Calculateur de prix rentable</h1>
                <p className="text-sm text-slate-500">Structurez vos couts, votre temps et votre marge cible.</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950">
              {premiumStatus === 'loading' ? 'Verification premium...' : isPremium ? 'Premium actif' : 'Mode gratuit'}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Opportunite</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextField label="Nom de l'opportunite" value={meta.title} onChange={(value) => updateMeta('title', value)} placeholder="Site vitrine - client X" />
              <TextField label="Client / prospect" value={meta.clientName} onChange={(value) => updateMeta('clientName', value)} placeholder="Nom du client" />
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Statut commercial</span>
                <select
                  value={meta.status}
                  onChange={(event) => updateMeta('status', event.target.value as OpportunityStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <NumberField label="Budget annonce par le client (EUR)" value={meta.clientBudget ? String(meta.clientBudget) : ''} onChange={(value) => updateMeta('clientBudget', value === '' ? 0 : Number(value))} />
              <NumberField label="Probabilite de signature (%)" value={String(meta.probability)} onChange={(value) => updateMeta('probability', value === '' ? 0 : Number(value))} />
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Deadline</span>
                <input
                  type="date"
                  value={meta.deadline}
                  onChange={(event) => updateMeta('deadline', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                />
              </label>
              <div className="md:col-span-2">
                <TextField label="Prochaine action" value={meta.nextAction} onChange={(value) => updateMeta('nextAction', value)} placeholder="Relancer mardi, envoyer une proposition..." />
              </div>
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
                <input
                  type="checkbox"
                  checked={meta.quoteValidated}
                  onChange={(event) => updateMeta('quoteValidated', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-950">Devis valide / prix accepte</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    Ce prix alimentera les statistiques anonymisees Tarifly pour ce metier, cette zone et cette unite.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Benchmark marche</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Metier</span>
                <select
                  value={market.professionSlug}
                  onChange={(event) => updateMarket('professionSlug', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <option value="">Selectionner un metier</option>
                  {professions.map((profession) => (
                    <option key={profession.slug} value={profession.slug}>
                      {profession.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Region</span>
                <select
                  value={market.region}
                  onChange={(event) => {
                    updateMarket('region', event.target.value);
                    updateMarket('city', '');
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <option value="">Selectionner une region</option>
                  {franceRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Ville optionnelle</span>
                <select
                  value={market.city}
                  onChange={(event) => updateMarket('city', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <option value="">Moyenne regionale</option>
                  {getCitiesForRegion(marketRates, market.region).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Prix compare</span>
                <select
                  value={market.unit}
                  onChange={(event) => updateMarket('unit', event.target.value as MarketUnit)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  {Object.entries(marketUnitLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {getComparisonLabel(value as MarketUnit, label)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Source du prix</span>
                <select
                  value={market.referenceMode}
                  onChange={(event) => updateMarket('referenceMode', event.target.value as MarketBenchmarkInput['referenceMode'])}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <option value="auto">{getAutoSourceLabel(market.unit)}</option>
                  <option value="manual">Saisir un autre prix</option>
                </select>
              </label>
              {market.referenceMode === 'manual' ? (
                <NumberField
                  label={`Prix ${marketUnitLabels[market.unit].toLowerCase()} a comparer (EUR)`}
                  value={market.manualPrice}
                  onChange={(value) => updateMarket('manualPrice', value)}
                />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Prix utilise</p>
                  <p className="mt-1 font-bold text-slate-950">{formatCurrency(marketReferencePrice)}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{getAutoExplanation(market.unit)}</p>
                </div>
              )}
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

            <NumberField label="Cout matiere / achat (EUR)" value={fields.productCost} onChange={(value) => updateNumber('productCost', value)} />
            <NumberField label="Temps de travail (heures)" value={fields.workHours} onChange={(value) => updateNumber('workHours', value)} />
            <NumberField label="Valeur horaire souhaitee (EUR)" value={fields.hourlyRate} onChange={(value) => updateNumber('hourlyRate', value)} />
            <NumberField label="Frais fixes a integrer (EUR)" value={fields.fixedFees} onChange={(value) => updateNumber('fixedFees', value)} />
            <NumberField label="Frais paiement / plateforme (%)" value={fields.transactionFeesPercent} onChange={(value) => updateNumber('transactionFeesPercent', value)} />
            <NumberField label="Marge cible (%)" value={fields.desiredMarginPercent} onChange={(value) => updateNumber('desiredMarginPercent', value)} />
            <NumberField label="TVA / taxe (%)" value={fields.taxPercent} onChange={(value) => updateNumber('taxPercent', value)} />
            <NumberField label="Prix concurrent optionnel (EUR)" value={fields.competitorPrice} onChange={(value) => updateNumber('competitorPrice', value)} />
          </div>

          <div className="mt-8">
            <MarketBenchmarkCard
              rate={matchingMarketRate}
              stat={matchingMarketStat}
              comparison={marketComparison}
              referencePrice={marketReferencePrice}
            />
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

function MarketBenchmarkCard({
  rate,
  stat,
  comparison,
  referencePrice,
}: {
  rate: MarketRate | null;
  stat: MarketRateStat | null;
  comparison: ReturnType<typeof compareToMarket>;
  referencePrice: number;
}) {
  if (!rate) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        Aucun benchmark trouve pour cette combinaison metier / zone / unite. Le calcul reste disponible, et vous pourrez
        enrichir la base marche dans Supabase.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Comparatif marche</p>
          <p className="mt-1 text-sm text-slate-600">Fourchette indicative issue de la base Tarifly.</p>
        </div>
      </div>
      <div className="grid gap-3 text-sm md:grid-cols-4">
        <BenchmarkMetric label="Prix bas" value={formatCurrency(rate.price_low)} />
        <BenchmarkMetric label="Median" value={formatCurrency(rate.price_median)} />
        <BenchmarkMetric label="Prix haut" value={formatCurrency(rate.price_high)} />
        <BenchmarkMetric label="Votre prix" value={formatCurrency(referencePrice)} />
      </div>
      {comparison ? (
        <div
          className={`mt-4 rounded-xl border p-4 ${
            comparison.level === 'above'
              ? 'border-amber-200 bg-amber-50 text-amber-950'
              : comparison.level === 'below'
                ? 'border-rose-200 bg-rose-50 text-rose-950'
                : 'border-emerald-200 bg-emerald-50 text-emerald-950'
          }`}
        >
          <p className="font-bold">{comparison.title}</p>
          <p className="mt-1 text-sm leading-6">{comparison.message}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
            Ecart median : {formatPercent(comparison.gapToMedian)}
          </p>
        </div>
      ) : null}
      {stat ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-950">Donnees utilisateurs validees</p>
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
            <BenchmarkMetric label="Moyenne observee" value={formatCurrency(stat.average_price)} />
            <BenchmarkMetric label="Mediane observee" value={formatCurrency(stat.median_price)} />
            <BenchmarkMetric label="Devis valides" value={`${stat.sample_count}`} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getAutoMarketReferencePrice(unit: MarketUnit, input: PricingInput, result: ReturnType<typeof calculatePricing>) {
  if (unit === 'hour') {
    return input.hourlyRate;
  }

  return result.priceIncludingTax;
}

function getComparisonLabel(unit: MarketUnit, label: string) {
  if (unit === 'hour') {
    return `${label} - compare votre taux horaire`;
  }

  if (unit === 'day') {
    return `${label} - compare votre prix jour`;
  }

  if (unit === 'sqm') {
    return `${label} - compare un prix au m2`;
  }

  return `${label} - compare le prix final`;
}

function getAutoSourceLabel(unit: MarketUnit) {
  if (unit === 'hour') {
    return 'Utiliser la valeur horaire saisie';
  }

  return 'Utiliser le prix recommande';
}

function getAutoExplanation(unit: MarketUnit) {
  if (unit === 'hour') {
    return 'Ce prix vient du champ valeur horaire souhaitee.';
  }

  return 'Ce prix vient du resultat calcule par Tarifly.';
}

function BenchmarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-950">{value}</p>
    </div>
  );
}

function getCitiesForRegion(rates: MarketRate[], region: string) {
  if (!region) {
    return [];
  }

  const normalizedRegion = normalize(region);
  return Array.from(
    new Set(
      rates
        .filter((rate) => normalize(rate.region ?? '') === normalizedRegion && rate.city)
        .map((rate) => rate.city as string),
    ),
  ).sort((a, b) => a.localeCompare(b, 'fr'));
}

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
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
