export type MarketUnit = 'hour' | 'day' | 'sqm' | 'project' | 'service';

export type Profession = {
  slug: string;
  label: string;
  activity_type: 'service' | 'product' | 'mixed';
};

export type MarketRate = {
  id: string;
  profession_slug: string;
  unit: MarketUnit;
  country: string;
  region: string | null;
  department: string | null;
  city: string | null;
  price_low: number;
  price_median: number;
  price_high: number;
  confidence_score: number;
  source_label: string | null;
  updated_at: string | null;
};

export type MarketRateStat = {
  profession_slug: string;
  unit: MarketUnit;
  country: string;
  city: string | null;
  sample_count: number;
  average_price: number;
  median_price: number;
  price_low: number;
  price_high: number;
  updated_at: string | null;
};

export type MarketBenchmarkInput = {
  professionSlug: string;
  city: string;
  unit: MarketUnit;
  referencePrice: string;
};

export const defaultMarketBenchmark: MarketBenchmarkInput = {
  professionSlug: '',
  city: '',
  unit: 'hour',
  referencePrice: '',
};

export const marketUnitLabels: Record<MarketUnit, string> = {
  hour: 'Heure',
  day: 'Jour',
  sqm: 'm2',
  project: 'Projet',
  service: 'Prestation',
};

export function findMarketRate(rates: MarketRate[], benchmark: MarketBenchmarkInput) {
  if (!benchmark.professionSlug) {
    return null;
  }

  const normalizedCity = normalize(benchmark.city);
  const exactCity = rates.find(
    (rate) =>
      rate.profession_slug === benchmark.professionSlug &&
      rate.unit === benchmark.unit &&
      normalize(rate.city ?? '') === normalizedCity,
  );

  if (exactCity) {
    return exactCity;
  }

  return (
    rates.find((rate) => rate.profession_slug === benchmark.professionSlug && rate.unit === benchmark.unit && !rate.city) ??
    rates.find((rate) => rate.profession_slug === benchmark.professionSlug && rate.unit === benchmark.unit) ??
    null
  );
}

export function findMarketRateStat(stats: MarketRateStat[], benchmark: MarketBenchmarkInput) {
  if (!benchmark.professionSlug) {
    return null;
  }

  const normalizedCity = normalize(benchmark.city);
  const exactCity = stats.find(
    (stat) =>
      stat.profession_slug === benchmark.professionSlug &&
      stat.unit === benchmark.unit &&
      normalize(stat.city ?? '') === normalizedCity,
  );

  if (exactCity) {
    return exactCity;
  }

  return (
    stats.find((stat) => stat.profession_slug === benchmark.professionSlug && stat.unit === benchmark.unit && !stat.city) ??
    null
  );
}

export function compareToMarket(referencePrice: number, rate: MarketRate | null) {
  if (!rate || referencePrice <= 0) {
    return null;
  }

  const gapToMedian = ((referencePrice - rate.price_median) / rate.price_median) * 100;
  let level: 'below' | 'inside' | 'above' = 'inside';
  let title = 'Prix coherent avec le marche';
  let message = 'Votre prix se situe dans la fourchette indicative observee pour ce metier et cette zone.';

  if (referencePrice < rate.price_low) {
    level = 'below';
    title = 'Prix sous le marche indicatif';
    message = 'Votre prix est sous la fourchette basse. Verifiez que votre marge couvre bien vos couts et vos imprevus.';
  } else if (referencePrice > rate.price_high) {
    level = 'above';
    title = 'Prix au-dessus du marche indicatif';
    message = 'Votre prix depasse la fourchette haute. Il peut rester defendable avec un positionnement premium clair.';
  }

  return {
    level,
    title,
    message,
    gapToMedian,
  };
}

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
