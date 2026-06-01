import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ToolForm } from '@/components/ToolForm';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { defaultOpportunityMeta, type OpportunityMeta } from '@/lib/opportunities';
import { defaultMarketBenchmark, type MarketBenchmarkInput, type Profession } from '@/lib/market';
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
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const { data: professionRows } = await supabase
      .from('professions')
      .select('slug, label, activity_type')
      .eq('active', true)
      .order('label', { ascending: true });

    professions = (professionRows ?? []) as Profession[];
  }

  if (calculationId) {
    const {
      data: { user },
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    if (supabase && user) {
      const { data: calculation } = await supabase
        .from('pricing_calculations')
        .select('input, title, client_name, opportunity_status, probability, deadline, client_budget, next_action, quote_validated, market_profession_slug, market_region, market_city, market_unit, market_reference_price')
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
          region: calculation.market_region ?? '',
          city: calculation.market_city ?? '',
          unit: calculation.market_unit ?? defaultMarketBenchmark.unit,
          referenceMode: 'manual',
          manualPrice: calculation.market_reference_price ? String(calculation.market_reference_price) : '',
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
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
