import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ToolForm } from '@/components/ToolForm';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { defaultOpportunityMeta, type OpportunityMeta } from '@/lib/opportunities';
import { defaultMarketBenchmark, type MarketBenchmarkInput, type MarketRate, type MarketRateStat, type Profession } from '@/lib/market';
import type { PricingInput } from '@/lib/pricing';

export default async function ToolPage({
  searchParams,
}: {
  searchParams?: Promise<{ calculation?: string }>;
}) {
  const params = await searchParams;
  const calculationId = params?.calculation;
  let initialInput: PricingInput | undefined;
  let initialMeta: OpportunityMeta | undefined;
  let initialMarket: MarketBenchmarkInput | undefined;
  let professions: Profession[] = [];
  let marketRates: MarketRate[] = [];
  let marketRateStats: MarketRateStat[] = [];
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const [{ data: professionRows }, { data: rateRows }, { data: statRows }] = await Promise.all([
      supabase.from('professions').select('slug, label, activity_type').order('label', { ascending: true }),
      supabase
        .from('market_rates')
        .select('id, profession_slug, unit, country, region, department, city, price_low, price_median, price_high, confidence_score, source_label, updated_at')
        .order('updated_at', { ascending: false }),
      supabase
        .from('market_rate_stats')
        .select('profession_slug, unit, country, city, sample_count, average_price, median_price, price_low, price_high, updated_at'),
    ]);

    professions = (professionRows ?? []) as Profession[];
    marketRates = (rateRows ?? []) as MarketRate[];
    marketRateStats = (statRows ?? []) as MarketRateStat[];
  }

  if (calculationId) {
    const {
      data: { user },
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    if (supabase && user) {
      const { data: calculation } = await supabase
        .from('pricing_calculations')
        .select('input, title, client_name, opportunity_status, probability, deadline, client_budget, next_action, quote_validated, market_profession_slug, market_city, market_unit, market_reference_price')
        .eq('id', calculationId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (calculation?.input) {
        initialInput = calculation.input as PricingInput;
        initialMeta = {
          ...defaultOpportunityMeta,
          title: calculation.title ?? '',
          clientName: calculation.client_name ?? '',
          status: calculation.opportunity_status ?? defaultOpportunityMeta.status,
          probability: calculation.probability ?? defaultOpportunityMeta.probability,
          deadline: calculation.deadline ?? '',
          clientBudget: calculation.client_budget ?? 0,
          nextAction: calculation.next_action ?? '',
          quoteValidated: calculation.quote_validated ?? false,
        };
        initialMarket = {
          ...defaultMarketBenchmark,
          professionSlug: calculation.market_profession_slug ?? '',
          city: calculation.market_city ?? '',
          unit: calculation.market_unit ?? defaultMarketBenchmark.unit,
          referencePrice: calculation.market_reference_price ? String(calculation.market_reference_price) : '',
        };
      }
    }
  }

  return (
    <>
      <Header />
      <main className="bg-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <ToolForm
            initialInput={initialInput}
            initialMeta={initialMeta}
            initialMarket={initialMarket}
            professions={professions}
            marketRates={marketRates}
            marketRateStats={marketRateStats}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
