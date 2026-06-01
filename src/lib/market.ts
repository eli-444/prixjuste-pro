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
  region: string | null;
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
  region: string;
  city: string;
  unit: MarketUnit;
  referenceMode: 'auto' | 'manual';
  manualPrice: string;
};

export const defaultMarketBenchmark: MarketBenchmarkInput = {
  professionSlug: '',
  region: '',
  city: '',
  unit: 'hour',
  referenceMode: 'auto',
  manualPrice: '',
};

export const franceRegions = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  "Provence-Alpes-Côte d’Azur",
  'La Réunion',
  'Guadeloupe',
  'Martinique',
  'Guyane',
  'Mayotte',
] as const;

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
  const normalizedRegion = normalize(benchmark.region);
  const scopedRates = rates.filter(
    (rate) =>
      rate.profession_slug === benchmark.professionSlug &&
      rate.unit === benchmark.unit &&
      (!benchmark.region || normalize(rate.region ?? '') === normalizedRegion),
  );
  const exactCity = benchmark.city
    ? scopedRates.find((rate) => normalize(rate.city ?? '') === normalizedCity)
    : null;

  if (exactCity) {
    return exactCity;
  }

  const exactRegion = scopedRates.find((rate) => !rate.city);

  if (exactRegion) {
    return exactRegion;
  }

  return aggregateMarketRates(scopedRates) ?? null;
}

export function findMarketRateStat(stats: MarketRateStat[], benchmark: MarketBenchmarkInput) {
  if (!benchmark.professionSlug) {
    return null;
  }

  const normalizedCity = normalize(benchmark.city);
  const normalizedRegion = normalize(benchmark.region);
  const scopedStats = stats.filter(
    (stat) =>
      stat.profession_slug === benchmark.professionSlug &&
      stat.unit === benchmark.unit &&
      (!benchmark.region || normalize(stat.region ?? '') === normalizedRegion),
  );
  const exactCity = benchmark.city
    ? scopedStats.find((stat) => normalize(stat.city ?? '') === normalizedCity)
    : null;

  if (exactCity) {
    return exactCity;
  }

  const exactRegion = scopedStats.find((stat) => !stat.city);

  if (exactRegion) {
    return exactRegion;
  }

  return aggregateMarketRateStats(scopedStats) ?? null;
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

function aggregateMarketRates(rates: MarketRate[]) {
  if (rates.length === 0) {
    return null;
  }

  const sample = rates[0];
  const average = (values: number[]) => values.reduce((total, value) => total + Number(value || 0), 0) / values.length;

  return {
    ...sample,
    id: `${sample.profession_slug}-${sample.region ?? 'region'}-${sample.unit}-aggregate`,
    city: null,
    price_low: average(rates.map((rate) => rate.price_low)),
    price_median: average(rates.map((rate) => rate.price_median)),
    price_high: average(rates.map((rate) => rate.price_high)),
    confidence_score: Math.round(average(rates.map((rate) => rate.confidence_score))),
    source_label: 'Moyenne regionale',
  };
}

function aggregateMarketRateStats(stats: MarketRateStat[]) {
  if (stats.length === 0) {
    return null;
  }

  const sample = stats[0];
  const sampleCount = stats.reduce((total, stat) => total + Number(stat.sample_count || 0), 0);
  const average = (values: number[]) => values.reduce((total, value) => total + Number(value || 0), 0) / values.length;

  return {
    ...sample,
    city: '',
    sample_count: sampleCount,
    average_price: average(stats.map((stat) => stat.average_price)),
    median_price: average(stats.map((stat) => stat.median_price)),
    price_low: average(stats.map((stat) => stat.price_low)),
    price_high: average(stats.map((stat) => stat.price_high)),
  };
}
