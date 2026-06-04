export type PricingInput = {
  activityType: 'service' | 'product' | 'mixed';
  billingMode: 'hourly' | 'fixed' | 'daily';
  productCost: number;
  workHours: number;
  hourlyRate: number;
  fixedFees: number;
  transactionFeesPercent: number;
  desiredMarginPercent: number;
  taxPercent: number;
  proposedPrice: number;
};

export type PricingResult = {
  baseCost: number;
  transactionFees: number;
  priceExcludingTax: number;
  taxAmount: number;
  priceIncludingTax: number;
  netProfit: number;
  marginRate: number;
  diagnosis: string;
  riskLevel: 'Faible' | 'Moyen' | 'Élevé';
  clientJustification: string;
  checklist: string[];
};

export type ProposedPriceAnalysis = {
  priceIncludingTax: number;
  priceExcludingTax: number;
  taxAmount: number;
  transactionFees: number;
  netProfit: number;
  marginRate: number;
  hourlyReality: number;
};

function safeNumber(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function getClientPrice(input: PricingInput) {
  if (input.billingMode === 'fixed') {
    return safeNumber(input.proposedPrice);
  }

  return safeNumber(input.workHours) * safeNumber(input.hourlyRate);
}

export function calculatePricing(input: PricingInput): PricingResult {
  const productCost = safeNumber(input.productCost);
  const clientLaborPrice = safeNumber(input.workHours) * safeNumber(input.hourlyRate);
  const fixedFees = safeNumber(input.fixedFees);
  const desiredMargin = Math.max(0, input.desiredMarginPercent) / 100;
  const transactionRate = Math.max(0, input.transactionFeesPercent) / 100;
  const taxRate = Math.max(0, input.taxPercent) / 100;

  const baseCost = productCost + fixedFees;
  const servicePrice = input.billingMode === 'fixed' ? 0 : clientLaborPrice;
  const pricedCosts = desiredMargin >= 1 ? baseCost * 2 : baseCost / (1 - desiredMargin);
  const priceBeforeFees = servicePrice + pricedCosts;
  const priceExcludingTax = transactionRate >= 1 ? priceBeforeFees : priceBeforeFees / (1 - transactionRate);
  const transactionFees = priceExcludingTax * transactionRate;
  const taxAmount = priceExcludingTax * taxRate;
  const priceIncludingTax = priceExcludingTax + taxAmount;
  const netProfit = priceExcludingTax - baseCost - transactionFees;
  const marginRate = priceExcludingTax > 0 ? (netProfit / priceExcludingTax) * 100 : 0;
  let riskLevel: PricingResult['riskLevel'] = 'Faible';
  let diagnosis =
    'Votre prix couvre les principaux postes de coût et conserve une marge exploitable. Vous disposez d’une base solide pour présenter votre proposition.';

  if (marginRate < 15) {
    riskLevel = 'Élevé';
    diagnosis =
      'Votre prix est fragile : la marge réelle reste trop faible pour absorber les imprévus, les ajustements client ou les frais oubliés.';
  } else if (marginRate < 30) {
    riskLevel = 'Moyen';
    diagnosis =
      'Votre prix est cohérent, mais la marge reste limitée. Vérifiez les frais annexes, le temps de préparation et les éventuelles reprises avant de valider.';
  }

  const roundedPrice = Math.ceil(priceIncludingTax / 5) * 5;

  return {
    baseCost,
    transactionFees,
    priceExcludingTax,
    taxAmount,
    priceIncludingTax: roundedPrice,
    netProfit,
    marginRate,
    diagnosis,
    riskLevel,
    clientJustification: `Prix recommandé : ${roundedPrice.toFixed(
      2,
    )} €. Ce tarif intègre le coût réel de la prestation, le temps de travail, les frais fixes, les frais de paiement et la marge nécessaire pour assurer un niveau de service sérieux, durable et correctement suivi.`,
    checklist: [
      'Le temps de préparation est bien inclus.',
      'Les coûts directs sont intégrés.',
      'Les frais fixes sont pris en compte.',
      'Les frais de paiement sont anticipés.',
      'Le prix final est arrondi pour rester lisible commercialement.',
    ],
  };
}

export function analyzeProposedPrice(input: PricingInput): ProposedPriceAnalysis {
  const productCost = safeNumber(input.productCost);
  const fixedFees = safeNumber(input.fixedFees);
  const transactionRate = Math.max(0, input.transactionFeesPercent) / 100;
  const taxRate = Math.max(0, input.taxPercent) / 100;
  const priceIncludingTax = getClientPrice(input);
  const priceExcludingTax = taxRate >= 1 ? priceIncludingTax : priceIncludingTax / (1 + taxRate);
  const transactionFees = priceExcludingTax * transactionRate;
  const baseCost = productCost + fixedFees;
  const netProfit = priceExcludingTax - baseCost - transactionFees;
  const marginRate = priceExcludingTax > 0 ? (netProfit / priceExcludingTax) * 100 : 0;
  const hourlyReality = safeNumber(input.workHours) > 0 ? netProfit / safeNumber(input.workHours) : 0;

  return {
    priceIncludingTax,
    priceExcludingTax,
    taxAmount: priceIncludingTax - priceExcludingTax,
    transactionFees,
    netProfit,
    marginRate,
    hourlyReality,
  };
}

