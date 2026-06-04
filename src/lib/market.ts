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
  let level: 'inside' | 'warning' | 'critical' = 'inside';
  let title = 'Prix cohérent avec le marché';
  let message = 'Votre prix se situe dans la fourchette indicative observée pour ce métier et cette zone.';

  if (referencePrice < rate.price_low) {
    const gapToLow = ((rate.price_low - referencePrice) / rate.price_low) * 100;
    level = gapToLow > 20 ? 'critical' : 'warning';
    title = gapToLow > 20 ? 'Prix très inférieur au marché' : 'Prix inférieur à la fourchette marché';
    message =
      gapToLow > 20
        ? "Votre prix est nettement sous la fourchette basse. Vérifiez que la mission reste rentable et qu'aucun coût n'a été oublié."
        : "Votre prix est sous la fourchette basse. L'écart reste à surveiller avant d'envoyer le devis.";
  } else if (referencePrice > rate.price_high) {
    const gapToHigh = ((referencePrice - rate.price_high) / rate.price_high) * 100;
    level = gapToHigh > 20 ? 'critical' : 'warning';
    title = gapToHigh > 20 ? 'Prix nettement supérieur au marché' : 'Prix supérieur à la fourchette marché';
    message =
      gapToHigh > 20
        ? 'Votre prix dépasse nettement la fourchette haute. Il faut pouvoir justifier clairement la valeur apportée.'
        : "Votre prix dépasse la fourchette haute. L'écart peut rester cohérent si votre positionnement est clair.";
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
    source_label: 'Moyenne régionale',
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

