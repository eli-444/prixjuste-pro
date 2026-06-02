'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Info, Lock, Save, X } from 'lucide-react';
import { analyzeProposedPrice, calculatePricing, getClientPrice, type PricingInput } from '@/lib/pricing';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { createQuotePdf, createTariflyPdf } from '@/lib/pdf';
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
const QUOTE_COMPANY_KEY = 'tarifly_quote_company';

type QuoteForm = {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  quoteNumber: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  description: string;
  validityDays: string;
};

const defaultInput: PricingInput = {
  activityType: 'service',
  billingMode: 'hourly',
  productCost: 50,
  workHours: 3,
  hourlyRate: 45,
  fixedFees: 25,
  transactionFeesPercent: 2,
  desiredMarginPercent: 35,
  taxPercent: 20,
  proposedPrice: 0,
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
  const normalizedInitialInput = { ...defaultInput, ...initialInput };
  const [input, setInput] = useState<PricingInput>(normalizedInitialInput);
  const [fields, setFields] = useState<Record<keyof Omit<PricingInput, 'activityType' | 'billingMode'>, string>>({
    productCost: String(normalizedInitialInput.productCost),
    workHours: String(normalizedInitialInput.workHours),
    hourlyRate: String(normalizedInitialInput.hourlyRate),
    fixedFees: String(normalizedInitialInput.fixedFees),
    transactionFeesPercent: String(normalizedInitialInput.transactionFeesPercent),
    desiredMarginPercent: String(normalizedInitialInput.desiredMarginPercent),
    taxPercent: String(normalizedInitialInput.taxPercent),
    proposedPrice: String(normalizedInitialInput.proposedPrice || ''),
  });
  const [meta, setMeta] = useState<OpportunityMeta>(initialMeta);
  const [market, setMarket] = useState<MarketBenchmarkInput>(initialMarket);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<'loading' | 'free' | 'premium'>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [marketRateRows, setMarketRateRows] = useState<MarketRate[]>(marketRates);
  const [marketRateStatRows, setMarketRateStatRows] = useState<MarketRateStat[]>(marketRateStats);
  const [marketDataStatus, setMarketDataStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [quoteForm, setQuoteForm] = useState<QuoteForm>(() => ({
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    quoteNumber: getDefaultQuoteNumber(),
    clientName: normalizedInitialInput ? initialMeta.clientName : '',
    clientAddress: '',
    clientEmail: '',
    description: initialMeta.title || 'Prestation',
    validityDays: '30',
  }));
  const result = useMemo(() => calculatePricing(input), [input]);
  const proposedAnalysis = useMemo(() => analyzeProposedPrice(input), [input]);
  const activePrice = getClientPrice(input);
  const availableMarketUnits = useMemo(
    () => getAvailableMarketUnits(marketRateRows, market),
    [marketRateRows, market.professionSlug, market.region, market.city],
  );
  const autoMarketReferencePrice = getAutoMarketReferencePrice(market.unit, input, activePrice);
  const marketReferencePrice =
    market.referenceMode === 'manual' ? Number(market.manualPrice || autoMarketReferencePrice) : autoMarketReferencePrice;
  const matchingMarketRate = useMemo(() => findMarketRate(marketRateRows, market), [marketRateRows, market]);
  const matchingMarketStat = useMemo(() => findMarketRateStat(marketRateStatRows, market), [marketRateStatRows, market]);
  const marketComparison = compareToMarket(marketReferencePrice, matchingMarketRate);
  const effectiveRiskLevel = getRiskLevel(proposedAnalysis.marginRate);
  const effectiveDiagnosis = getDiagnosis(proposedAnalysis.marginRate);
  const effectiveJustification = getClientJustification(input, activePrice);
  const selectedProfession = professions.find((profession) => profession.slug === market.professionSlug);

  useEffect(() => {
    if (!market.professionSlug || availableMarketUnits.length === 0 || availableMarketUnits.includes(market.unit)) {
      return;
    }

    setMarket((current) => ({
      ...current,
      unit: availableMarketUnits[0],
    }));
  }, [availableMarketUnits, market.professionSlug, market.unit]);

  useEffect(() => {
    if (!market.city) {
      return;
    }

    const availableCities = getCitiesForRegion(marketRateRows, market.region, market.professionSlug);
    if (!availableCities.includes(market.city)) {
      setMarket((current) => ({
        ...current,
        city: '',
      }));
    }
  }, [market.city, market.professionSlug, market.region, marketRateRows]);

  useEffect(() => {
    let isMounted = true;

    async function loadFilteredMarketRates() {
      if (!market.professionSlug || !market.region) {
        setMarketRateRows([]);
        setMarketRateStatRows([]);
        setMarketDataStatus('idle');
        return;
      }

      if (!getSupabaseConfig().isConfigured) {
        setMarketDataStatus('error');
        return;
      }

      setMarketDataStatus('loading');

      try {
        const supabase = createBrowserSupabaseClient();
        const marketRateQuery = supabase
          .from('market_rates')
          .select('id, profession_slug, unit, country, region, department, city, price_low, price_median, price_high, confidence_score, source_label, updated_at')
          .eq('profession_slug', market.professionSlug)
          .eq('region', market.region)
          .order('city', { ascending: true });

        const statQuery = supabase
          .from('market_rate_stats')
          .select('profession_slug, unit, country, region, city, sample_count, average_price, median_price, price_low, price_high, updated_at')
          .eq('profession_slug', market.professionSlug)
          .eq('region', market.region)
          .order('city', { ascending: true });

        const [{ data: rateData, error: rateError }, { data: statData, error: statError }] = await Promise.all([
          marketRateQuery,
          statQuery,
        ]);

        if (process.env.NODE_ENV === 'development') {
          console.info('[Tarifly market_rates]', {
            selectedProfessionSlug: market.professionSlug,
            selectedRegion: market.region,
            selectedCity: market.city || 'Moyenne regionale',
            query: {
              table: 'market_rates',
              filters: {
                profession_slug: market.professionSlug,
                region: market.region,
              },
              order: 'city',
            },
            data: rateData,
            error: rateError,
          });
          console.info('[Tarifly market_rate_stats]', {
            selectedProfessionSlug: market.professionSlug,
            selectedRegion: market.region,
            selectedCity: market.city || 'Moyenne regionale',
            data: statData,
            error: statError,
          });
        }

        if (!isMounted) {
          return;
        }

        if (rateError) {
          setMarketRateRows([]);
          setMarketRateStatRows([]);
          setMarketDataStatus('error');
          return;
        }

        setMarketRateRows((rateData ?? []) as MarketRate[]);
        setMarketRateStatRows(statError ? [] : ((statData ?? []) as MarketRateStat[]));
        setMarketDataStatus('ready');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.info('[Tarifly market_rates]', {
            selectedProfessionSlug: market.professionSlug,
            selectedRegion: market.region,
            selectedCity: market.city || 'Moyenne regionale',
            error,
          });
        }

        if (isMounted) {
          setMarketRateRows([]);
          setMarketRateStatRows([]);
          setMarketDataStatus('error');
        }
      }
    }

    loadFilteredMarketRates();

    return () => {
      isMounted = false;
    };
  }, [market.professionSlug, market.region]);

  useEffect(() => {
    const storedCompany = window.localStorage.getItem(QUOTE_COMPANY_KEY);
    if (!storedCompany) {
      return;
    }

    try {
      const company = JSON.parse(storedCompany) as Partial<QuoteForm>;
      setQuoteForm((current) => ({
        ...current,
        companyName: company.companyName ?? current.companyName,
        companyAddress: company.companyAddress ?? current.companyAddress,
        companyEmail: company.companyEmail ?? current.companyEmail,
        companyPhone: company.companyPhone ?? current.companyPhone,
      }));
    } catch {
      window.localStorage.removeItem(QUOTE_COMPANY_KEY);
    }
  }, []);

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
    if (name === 'activityType' || name === 'billingMode') {
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
        result: {
          ...result,
          proposedAnalysis,
          effectiveRiskLevel,
          effectiveDiagnosis,
          effectiveJustification,
        },
        recommended_price: activePrice,
      });

      if (error) {
        throw error;
      }

      setSaveStatus('Calcul sauvegarde dans votre compte.');
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : 'Sauvegarde impossible pour le moment.');
    }
  }

  async function downloadExport() {
    const blob = await createTariflyPdf({
      title: 'Rapport de rentabilite',
      generatedAt: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date()),
      metrics: [
        { label: 'Prix client TTC', value: formatCurrency(activePrice) },
        { label: 'Prix hors taxes estime', value: formatCurrency(proposedAnalysis.priceExcludingTax) },
        { label: 'Profit net estime', value: formatCurrency(proposedAnalysis.netProfit) },
        { label: 'Marge reelle', value: formatPercent(proposedAnalysis.marginRate) },
        { label: 'Couts renseignes', value: formatCurrency(result.baseCost) },
        { label: 'Niveau de risque', value: effectiveRiskLevel },
      ],
      sections: [
        {
          title: 'Resume du formulaire',
          body: [
            `Opportunite : ${meta.title || 'Calcul sans titre'}`,
            `Client : ${meta.clientName || 'Non renseigne'}`,
            `Statut : ${statusLabels[meta.status]}`,
            `Budget client : ${formatCurrency(Number(meta.clientBudget || 0))}`,
            `Probabilite : ${formatPercent(meta.probability)}`,
            `Mode de facturation : ${input.billingMode === 'hourly' ? 'A l heure' : 'Forfait'}`,
            `Prix client TTC : ${formatCurrency(activePrice)}`,
          ],
        },
        {
          title: 'Couts et facturation',
          body: [
            `Type d activite : ${getActivityTypeLabel(input.activityType)}`,
            `Cout matiere / achat : ${formatCurrency(input.productCost)}`,
            `Frais fixes : ${formatCurrency(input.fixedFees)}`,
            `Frais paiement / plateforme : ${formatPercent(input.transactionFeesPercent)}`,
            `TVA / taxe : ${formatPercent(input.taxPercent)}`,
            `Temps prevu : ${input.workHours} h`,
            `Tarif horaire facture : ${formatCurrency(input.hourlyRate)}`,
          ],
        },
        {
          title: 'Veille concurrentielle',
          body: buildMarketExportLines(
            selectedProfession?.label,
            market,
            matchingMarketRate,
            matchingMarketStat,
            marketComparison,
            marketReferencePrice,
          ),
        },
        { title: 'Diagnostic', body: effectiveDiagnosis },
        { title: 'Justification client', body: effectiveJustification },
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

  function downloadCsvExport() {
    const rows = [
      ['Section', 'Champ', 'Valeur'],
      ['Client', 'Opportunite', meta.title || 'Calcul sans titre'],
      ['Client', 'Client / prospect', meta.clientName || 'Non renseigne'],
      ['Client', 'Statut', statusLabels[meta.status]],
      ['Client', 'Budget annonce', formatCurrency(Number(meta.clientBudget || 0))],
      ['Client', 'Probabilite', formatPercent(meta.probability)],
      ['Couts', 'Type activite', getActivityTypeLabel(input.activityType)],
      ['Couts', 'Cout matiere / achat', formatCurrency(input.productCost)],
      ['Couts', 'Frais fixes', formatCurrency(input.fixedFees)],
      ['Couts', 'Frais paiement / plateforme', formatPercent(input.transactionFeesPercent)],
      ['Couts', 'TVA / taxe', formatPercent(input.taxPercent)],
      ['Facturation', 'Mode', input.billingMode === 'hourly' ? 'A l heure' : 'Forfait'],
      ['Facturation', 'Temps prevu', `${input.workHours} h`],
      ['Facturation', 'Tarif horaire facture', formatCurrency(input.hourlyRate)],
      ['Facturation', 'Prix client TTC', formatCurrency(activePrice)],
      ['Rentabilite', 'Prix HT estime', formatCurrency(proposedAnalysis.priceExcludingTax)],
      ['Rentabilite', 'Profit net estime', formatCurrency(proposedAnalysis.netProfit)],
      ['Rentabilite', 'Marge reelle', formatPercent(proposedAnalysis.marginRate)],
      ['Rentabilite', 'Niveau de risque', effectiveRiskLevel],
      ...buildMarketCsvRows(selectedProfession?.label, market, matchingMarketRate, matchingMarketStat, marketReferencePrice),
    ];
    const csv = rows.map((row) => row.map(escapeCsvValue).join(';')).join('\n');
    downloadBlob(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }), 'resume-tarifly.csv');
  }

  function openQuoteModal() {
    setQuoteError('');
    setQuoteForm((current) => ({
      ...current,
      clientName: current.clientName || meta.clientName,
      description: current.description || meta.title || 'Prestation',
    }));
    setQuoteModalOpen(true);
  }

  function updateQuoteField(name: keyof QuoteForm, value: string) {
    setQuoteForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function generateQuotePdf() {
    const requiredFields: Array<keyof QuoteForm> = ['companyName', 'companyAddress', 'quoteNumber', 'clientName', 'clientAddress'];
    const missingField = requiredFields.find((field) => !quoteForm[field].trim());

    if (missingField) {
      setQuoteError('Merci de remplir les informations entreprise, client et numero de devis.');
      return;
    }

    window.localStorage.setItem(
      QUOTE_COMPANY_KEY,
      JSON.stringify({
        companyName: quoteForm.companyName,
        companyAddress: quoteForm.companyAddress,
        companyEmail: quoteForm.companyEmail,
        companyPhone: quoteForm.companyPhone,
      }),
    );

    const taxRate = Math.max(0, input.taxPercent) / 100;
    const quantity = input.billingMode === 'hourly' ? Math.max(0, input.workHours) : 1;
    const unitPriceExcludingTax =
      input.billingMode === 'hourly'
        ? taxRate >= 1
          ? input.hourlyRate
          : input.hourlyRate / (1 + taxRate)
        : proposedAnalysis.priceExcludingTax;

    const blob = await createQuotePdf({
      quoteNumber: quoteForm.quoteNumber,
      quoteDate: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date()),
      company: {
        name: quoteForm.companyName,
        address: quoteForm.companyAddress,
        email: quoteForm.companyEmail,
        phone: quoteForm.companyPhone,
      },
      client: {
        name: quoteForm.clientName,
        address: quoteForm.clientAddress,
        email: quoteForm.clientEmail,
      },
      line: {
        description: quoteForm.description || meta.title || 'Prestation',
        quantity: input.billingMode === 'hourly' ? `${quantity}` : '1',
        unit: input.billingMode === 'hourly' ? 'heure' : 'forfait',
        unitPriceExcludingTax: formatCurrency(unitPriceExcludingTax),
        totalExcludingTax: formatCurrency(proposedAnalysis.priceExcludingTax),
      },
      totals: {
        subtotalExcludingTax: formatCurrency(proposedAnalysis.priceExcludingTax),
        taxRate: formatPercent(input.taxPercent),
        taxAmount: formatCurrency(proposedAnalysis.taxAmount),
        totalIncludingTax: formatCurrency(activePrice),
      },
      validityDays: quoteForm.validityDays || '30',
    });

    downloadBlob(blob, `devis-${sanitizeFilename(quoteForm.quoteNumber)}.pdf`);
    setQuoteModalOpen(false);
  }

  return (
    <>
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
      <div id="hypotheses" className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
          <FormSection
            number="01"
            title="Client"
            description="Identifiez le prospect, l'etape du pipeline et le contexte de decision."
            tone="dark"
          >
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextField label="Nom de l'opportunite" value={meta.title} onChange={(value) => updateMeta('title', value)} placeholder="Site vitrine - client X" help="Nom interne du calcul ou du dossier commercial que vous voulez retrouver plus tard." />
              <TextField label="Client / prospect" value={meta.clientName} onChange={(value) => updateMeta('clientName', value)} placeholder="Nom du client" help="Nom de l'entreprise ou de la personne a qui vous allez proposer le prix." />
              <label className="space-y-2">
                <LabelWithInfo label="Statut commercial" help="Position du dossier dans votre suivi : a chiffrer, proposition envoyee, negociation, gagne ou perdu." />
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
              <NumberField label="Budget annonce par le client (EUR)" value={meta.clientBudget ? String(meta.clientBudget) : ''} onChange={(value) => updateMeta('clientBudget', value === '' ? 0 : Number(value))} help="Montant que le client pense pouvoir investir. Sert a situer votre prix face a son budget." />
              <NumberField label="Probabilite de signature (%)" value={String(meta.probability)} onChange={(value) => updateMeta('probability', value === '' ? 0 : Number(value))} help="Estimation commerciale de vos chances de gagner le dossier. Sert au tableau des opportunites." />
              <label className="space-y-2">
                <LabelWithInfo label="Deadline" help="Date limite de reponse ou date a laquelle vous devez relancer le client." />
                <input
                  type="date"
                  value={meta.deadline}
                  onChange={(event) => updateMeta('deadline', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                />
              </label>
              <div className="md:col-span-2">
                <TextField label="Prochaine action" value={meta.nextAction} onChange={(value) => updateMeta('nextAction', value)} placeholder="Relancer mardi, envoyer une proposition..." help="Prochaine tache a effectuer pour faire avancer l'opportunite." />
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
          </FormSection>

          <FormSection
            number="02"
            title="Couts"
          >
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <LabelWithInfo label="Type d'activite" help="Indique si vous vendez surtout du service, un produit, ou un mix des deux. Cela aide a structurer le calcul." />
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

            <NumberField label="Cout matiere / achat (EUR)" value={fields.productCost} onChange={(value) => updateNumber('productCost', value)} help="Achats, sous-traitance, matiere, licences ou fournitures necessaires pour realiser la mission." />
            <NumberField label="Frais fixes a integrer (EUR)" value={fields.fixedFees} onChange={(value) => updateNumber('fixedFees', value)} help="Frais a absorber dans ce prix : deplacement, preparation, administratif, outil, emballage ou frais annexes." />
            <NumberField label="Frais paiement / plateforme (%)" value={fields.transactionFeesPercent} onChange={(value) => updateNumber('transactionFeesPercent', value)} help="Commission Stripe, plateforme, marketplace ou frais de transaction appliques au montant facture." />
            <NumberField label="TVA / taxe (%)" value={fields.taxPercent} onChange={(value) => updateNumber('taxPercent', value)} help="Taux de TVA ou taxe appliquee au prix client. Mettez 0 si vous n'etes pas concerne." />
          </div>
          </FormSection>

          <FormSection
            number="03"
            title="Facturation client"
            tone="muted"
          >
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <LabelWithInfo label="Mode de facturation" help="Choisissez si le prix client est calcule avec un tarif horaire ou avec un montant forfaitaire." />
              <select
                value={input.billingMode}
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    billingMode: event.target.value as PricingInput['billingMode'],
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <option value="hourly">A l'heure : tarif horaire x temps prevu</option>
                <option value="fixed">Au forfait : montant global du devis</option>
              </select>
            </label>
            {input.billingMode === 'hourly' ? (
              <>
                <NumberField label="Tarif horaire facture au client (EUR)" value={fields.hourlyRate} onChange={(value) => updateNumber('hourlyRate', value)} help="Prix que vous facturez au client pour une heure de travail." />
                <NumberField label="Temps prevu (heures)" value={fields.workHours} onChange={(value) => updateNumber('workHours', value)} help="Nombre d'heures estime pour produire la mission." />
              </>
            ) : (
              <>
                <NumberField label="Montant global du devis (EUR TTC)" value={fields.proposedPrice} onChange={(value) => updateNumber('proposedPrice', value)} help="Prix total que vous souhaitez annoncer au client pour la mission." />
                <NumberField label="Temps prevu (heures)" value={fields.workHours} onChange={(value) => updateNumber('workHours', value)} help="Temps estime pour mesurer la rentabilite horaire du forfait." />
              </>
            )}
            <div className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Prix calcule</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(activePrice)}</p>
            </div>
            <details className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
              <summary className="cursor-pointer text-sm font-bold text-slate-950">Option : objectif de marge pour simulation</summary>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <NumberField label="Marge cible (%)" value={fields.desiredMarginPercent} onChange={(value) => updateNumber('desiredMarginPercent', value)} help="Objectif de marge utilise uniquement pour simuler un prix recommande." />
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Simulation</p>
                  <p className="mt-1 font-bold text-slate-950">{formatCurrency(result.priceIncludingTax)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Cette option sert uniquement a tester un objectif. La marge reelle affichee a droite reste calculee sur votre prix client.
              </p>
            </details>
          </div>
          </FormSection>

          <FormSection
            number="04"
            title="Comparaison marche"
          >
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <LabelWithInfo label="Metier" help="Metier utilise pour retrouver les prix de marche dans Supabase. La valeur technique envoyee est le slug." />
                <select
                  value={market.professionSlug}
                  onChange={(event) => {
                    updateMarket('professionSlug', event.target.value);
                    updateMarket('city', '');
                  }}
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
                <LabelWithInfo label="Region" help="Zone geographique utilisee pour charger les villes et les prix de marche disponibles." />
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
                <LabelWithInfo label="Ville optionnelle" help="Choisissez une ville precise si elle existe, ou gardez Moyenne regionale pour utiliser une moyenne des villes disponibles." />
                <select
                  value={market.city}
                  onChange={(event) => updateMarket('city', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <option value="">Moyenne regionale</option>
                  {getCitiesForRegion(marketRateRows, market.region, market.professionSlug).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <LabelWithInfo label="Prix compare" help="Unite de comparaison disponible pour ce metier et cette region : heure, prestation, jour, projet ou m2." />
                <select
                  value={market.unit}
                  onChange={(event) => updateMarket('unit', event.target.value as MarketUnit)}
                  disabled={!market.professionSlug || availableMarketUnits.length === 0}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  {!market.professionSlug ? <option value={market.unit}>Selectionner un metier</option> : null}
                  {market.professionSlug && availableMarketUnits.length === 0 ? (
                    <option value={market.unit}>Aucune unite disponible</option>
                  ) : null}
                  {availableMarketUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {marketUnitLabels[unit]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <LabelWithInfo label="Source du prix" help="Utilisez automatiquement le prix calcule par Tarifly ou saisissez un autre prix a comparer au marche." />
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
                  help="Prix manuel utilise pour le benchmark si vous ne voulez pas utiliser le prix calcule automatiquement."
                />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Prix utilise</p>
                  <p className="mt-1 font-bold text-slate-950">{formatCurrency(marketReferencePrice)}</p>
                </div>
              )}
              {marketDataStatus === 'loading' ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 md:col-span-2">
                  Chargement des donnees marche...
                </p>
              ) : null}
              {marketDataStatus === 'error' ? (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 md:col-span-2">
                  Impossible de charger les donnees marche pour cette selection.
                </p>
              ) : null}
            </div>
          </FormSection>

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
          <p className="text-sm text-slate-300">Prix client calcule</p>
          <p className="mt-1 text-5xl font-bold tracking-tight">{formatCurrency(activePrice)}</p>
          <p className="mt-2 text-sm text-slate-300">
            {input.billingMode === 'hourly' ? 'Tarif horaire x temps prevu' : 'Montant forfaitaire du devis'}
          </p>
        </div>

        {premiumStatus === 'loading' ? (
          <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-200">
            Verification de votre acces premium en cours...
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 text-sm">
          <Metric label="Couts renseignes" value={formatCurrency(result.baseCost)} />
          <Metric label="Profit net estime" value={isPremium ? formatCurrency(proposedAnalysis.netProfit) : 'Premium'} locked={!isPremium} />
          <Metric label="Marge reelle" value={isPremium ? formatPercent(proposedAnalysis.marginRate) : 'Premium'} locked={!isPremium} />
          <Metric label="Rentabilite horaire" value={isPremium ? formatCurrency(proposedAnalysis.hourlyReality) : 'Premium'} locked={!isPremium} />
          <Metric label="Niveau de risque" value={isPremium ? effectiveRiskLevel : 'Premium'} locked={!isPremium} />
        </div>

        {isPremium ? (
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="font-semibold">Diagnostic</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{effectiveDiagnosis}</p>
            <p className="mt-4 font-semibold">Justification client</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{effectiveJustification}</p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="flex items-center gap-2 font-semibold">
              <Lock size={16} />
              Analyse complete verrouillee
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              La version gratuite affiche le prix client. Le premium debloque la marge, le risque, le diagnostic et
              l'export PDF professionnel.
            </p>
            <CheckoutButton className="mt-4 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              Demarrer Premium - 9,90 EUR / mois
            </CheckoutButton>
          </div>
        )}

        <div id="exports" className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={isPremium ? downloadExport : undefined}
            disabled={!isPremium}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export PDF
          </button>
          <button
            onClick={isPremium ? downloadCsvExport : undefined}
            disabled={!isPremium}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet size={16} />
            Export CSV
          </button>
          <button onClick={saveCalculation} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold transition hover:bg-white/10">
            <Save size={16} />
            Sauvegarder cette opportunite
          </button>
          <button type="button" onClick={openQuoteModal} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold transition hover:bg-white/10">
            <FileText size={16} />
            Generer devis
          </button>
        </div>

        {saveStatus ? <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-200">{saveStatus}</p> : null}
      </aside>
    </section>
    {quoteModalOpen ? (
      <QuoteModal
        form={quoteForm}
        error={quoteError}
        onChange={updateQuoteField}
        onClose={() => setQuoteModalOpen(false)}
        onGenerate={generateQuotePdf}
      />
    ) : null}
    </>
  );
}

function QuoteModal({
  form,
  error,
  onChange,
  onClose,
  onGenerate,
}: {
  form: QuoteForm;
  error: string;
  onChange: (name: keyof QuoteForm, value: string) => void;
  onClose: () => void;
  onGenerate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/40 px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Generer un devis</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Le PDF client contient uniquement les informations commerciales du devis.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-slate-950">Votre entreprise</h3>
            <TextField label="Nom entreprise" value={form.companyName} onChange={(value) => onChange('companyName', value)} help="Nom qui apparaitra comme emetteur du devis." />
            <TextAreaField label="Adresse entreprise" value={form.companyAddress} onChange={(value) => onChange('companyAddress', value)} help="Adresse postale affichee dans le bloc emetteur du devis." />
            <TextField label="Email" value={form.companyEmail} onChange={(value) => onChange('companyEmail', value)} help="Email de contact affiche sur le devis." />
            <TextField label="Telephone" value={form.companyPhone} onChange={(value) => onChange('companyPhone', value)} help="Telephone de contact affiche sur le devis." />
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-slate-950">Client</h3>
            <TextField label="Nom client" value={form.clientName} onChange={(value) => onChange('clientName', value)} help="Nom de la personne ou de l'entreprise destinataire du devis." />
            <TextAreaField label="Adresse client" value={form.clientAddress} onChange={(value) => onChange('clientAddress', value)} help="Adresse du client affichee sur le devis." />
            <TextField label="Email client" value={form.clientEmail} onChange={(value) => onChange('clientEmail', value)} help="Email du client affiche sur le devis si vous souhaitez l'inclure." />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <TextField label="Numero du devis" value={form.quoteNumber} onChange={(value) => onChange('quoteNumber', value)} help="Reference unique du devis pour votre suivi commercial et administratif." />
          <TextField label="Validite (jours)" value={form.validityDays} onChange={(value) => onChange('validityDays', value)} help="Duree pendant laquelle le prix propose reste valable." />
          <div className="md:col-span-3">
            <TextAreaField label="Intitule de la prestation" value={form.description} onChange={(value) => onChange('description', value)} help="Description courte de ce qui sera vendu au client dans le devis." />
          </div>
        </div>

        {error ? <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onGenerate}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Generer devis
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSection({
  number,
  title,
  description,
  children,
  tone = 'light',
}: {
  number: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: 'light' | 'muted' | 'dark';
}) {
  const styles = {
    light: 'border-slate-200 bg-white',
    muted: 'border-slate-200 bg-slate-50',
    dark: 'border-slate-950 bg-slate-950 text-white',
  };
  const mutedText = tone === 'dark' ? 'text-slate-300' : 'text-slate-500';
  const pill = tone === 'dark' ? 'bg-white text-slate-950' : 'bg-slate-950 text-white';

  return (
    <section className={`mt-8 rounded-2xl border p-5 ${styles[tone]}`}>
      <div className="flex items-start gap-4">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${pill}`}>{number}</span>
        <div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          {description ? <p className={`mt-1 text-sm leading-6 ${mutedText}`}>{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function getRiskLevel(marginRate: number) {
  if (marginRate < 15) {
    return 'Eleve';
  }

  if (marginRate < 30) {
    return 'Moyen';
  }

  return 'Faible';
}

function getDiagnosis(marginRate: number) {
  if (marginRate < 15) {
    return 'La rentabilite est fragile : le prix client couvre difficilement les couts renseignes et laisse peu de marge pour les imprevus.';
  }

  if (marginRate < 30) {
    return 'La rentabilite est correcte mais limitee. Verifiez les frais annexes, le temps reel et les ajustements possibles avant d envoyer le devis.';
  }

  return 'La rentabilite est saine : le prix client couvre les couts renseignes et conserve une marge confortable pour executer la mission proprement.';
}

function getClientJustification(input: PricingInput, activePrice: number) {
  if (input.billingMode === 'hourly') {
    return `Prix client : ${formatCurrency(activePrice)}. Ce montant correspond au tarif horaire facture multiplie par le temps estime, avec les couts directs et frais renseignes controles dans la marge.`;
  }

  return `Prix client : ${formatCurrency(activePrice)}. Ce montant correspond au forfait du devis, avec une rentabilite controlee a partir des couts directs, frais fixes, frais de paiement et taxes renseignes.`;
}

function getActivityTypeLabel(activityType: PricingInput['activityType']) {
  const labels: Record<PricingInput['activityType'], string> = {
    service: 'Service',
    product: 'Produit',
    mixed: 'Mixte',
  };

  return labels[activityType];
}

function buildMarketExportLines(
  professionLabel: string | undefined,
  market: MarketBenchmarkInput,
  rate: MarketRate | null,
  stat: MarketRateStat | null,
  comparison: ReturnType<typeof compareToMarket>,
  referencePrice: number,
) {
  const lines = [
    `Metier : ${professionLabel || 'Non renseigne'}`,
    `Region : ${market.region || 'Non renseignee'}`,
    `Ville : ${market.city || 'Moyenne regionale'}`,
    `Unite comparee : ${marketUnitLabels[market.unit]}`,
    `Prix utilise : ${formatCurrency(referencePrice)}`,
  ];

  if (rate) {
    lines.push(`Prix bas marche : ${formatCurrency(rate.price_low)}`);
    lines.push(`Prix median marche : ${formatCurrency(rate.price_median)}`);
    lines.push(`Prix haut marche : ${formatCurrency(rate.price_high)}`);
  } else {
    lines.push('Benchmark marche : non disponible pour cette combinaison');
  }

  if (comparison) {
    lines.push(`Positionnement : ${comparison.title}`);
    lines.push(`Ecart median : ${formatPercent(comparison.gapToMedian)}`);
  }

  if (stat) {
    lines.push(`Moyenne utilisateurs validee : ${formatCurrency(stat.average_price)}`);
    lines.push(`Mediane utilisateurs validee : ${formatCurrency(stat.median_price)}`);
    lines.push(`Devis utilisateurs valides : ${stat.sample_count}`);
  }

  return lines;
}

function buildMarketCsvRows(
  professionLabel: string | undefined,
  market: MarketBenchmarkInput,
  rate: MarketRate | null,
  stat: MarketRateStat | null,
  referencePrice: number,
) {
  const rows = [
    ['Veille marche', 'Metier', professionLabel || 'Non renseigne'],
    ['Veille marche', 'Region', market.region || 'Non renseignee'],
    ['Veille marche', 'Ville', market.city || 'Moyenne regionale'],
    ['Veille marche', 'Unite comparee', marketUnitLabels[market.unit]],
    ['Veille marche', 'Prix utilise', formatCurrency(referencePrice)],
  ];

  if (rate) {
    rows.push(['Veille marche', 'Prix bas marche', formatCurrency(rate.price_low)]);
    rows.push(['Veille marche', 'Prix median marche', formatCurrency(rate.price_median)]);
    rows.push(['Veille marche', 'Prix haut marche', formatCurrency(rate.price_high)]);
  }

  if (stat) {
    rows.push(['Veille marche', 'Moyenne utilisateurs validee', formatCurrency(stat.average_price)]);
    rows.push(['Veille marche', 'Mediane utilisateurs validee', formatCurrency(stat.median_price)]);
    rows.push(['Veille marche', 'Devis utilisateurs valides', String(stat.sample_count)]);
  }

  return rows;
}

function escapeCsvValue(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getDefaultQuoteNumber() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  return `DEV-${datePart}-${timePart}`;
}

function sanitizeFilename(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'devis';
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
        Aucun benchmark trouve pour cette combinaison. 
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Comparatif marche</p>
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
            comparison.level === 'critical'
              ? 'border-rose-200 bg-rose-50 text-rose-950'
              : comparison.level === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-950'
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

function getAutoMarketReferencePrice(unit: MarketUnit, input: PricingInput, activePrice: number) {
  if (unit === 'hour') {
    return input.hourlyRate;
  }

  return activePrice;
}

function getAutoSourceLabel(unit: MarketUnit) {
  if (unit === 'hour') {
    return 'Utiliser le tarif horaire facture';
  }

  return 'Utiliser le prix client calcule';
}

function BenchmarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-950">{value}</p>
    </div>
  );
}

function getAvailableMarketUnits(rates: MarketRate[], benchmark: MarketBenchmarkInput) {
  const orderedUnits = Object.keys(marketUnitLabels) as MarketUnit[];

  if (!benchmark.professionSlug) {
    return [];
  }

  return orderedUnits.filter((unit) =>
    Boolean(
      findMarketRate(rates, {
        ...benchmark,
        unit,
      }),
    ),
  );
}

function getCitiesForRegion(rates: MarketRate[], region: string, professionSlug: string) {
  if (!region) {
    return [];
  }

  const normalizedRegion = normalize(region);
  return Array.from(
    new Set(
      rates
        .filter(
          (rate) =>
            normalize(rate.region ?? '') === normalizedRegion &&
            (!professionSlug || rate.profession_slug === professionSlug) &&
            rate.city,
        )
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
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: string;
}) {
  return (
    <label className="space-y-2">
      <LabelWithInfo label={label} help={help} />
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

function TextAreaField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <label className="space-y-2">
      <LabelWithInfo label={label} help={help} />
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <label className="space-y-2">
      <LabelWithInfo label={label} help={help} />
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

function LabelWithInfo({ label, help }: { label: string; help?: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      {help ? (
        <span className="group relative inline-flex">
          <Info size={14} className="cursor-help text-slate-400" aria-label={help} />
          <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium leading-5 text-slate-600 shadow-soft group-hover:block">
            {help}
          </span>
        </span>
      ) : null}
    </span>
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
