export const opportunityStatuses = ['new', 'to_price', 'proposal_sent', 'negotiation', 'won', 'lost'] as const;

export type OpportunityStatus = (typeof opportunityStatuses)[number];

export type OpportunityMeta = {
  title: string;
  clientName: string;
  status: OpportunityStatus;
  probability: number;
  deadline: string;
  clientBudget: number;
  nextAction: string;
  quoteValidated: boolean;
};

export const defaultOpportunityMeta: OpportunityMeta = {
  title: '',
  clientName: '',
  status: 'to_price',
  probability: 50,
  deadline: '',
  clientBudget: 0,
  nextAction: '',
  quoteValidated: false,
};

export const statusLabels: Record<OpportunityStatus, string> = {
  new: 'Nouveau prospect',
  to_price: 'A chiffrer',
  proposal_sent: 'Prix propose',
  negotiation: 'Negociation',
  won: 'Accepte',
  lost: 'Refuse',
};

export function getOpportunityScore({
  marginRate,
  probability,
  clientBudget,
  recommendedPrice,
}: {
  marginRate: number;
  probability: number;
  clientBudget: number;
  recommendedPrice: number;
}) {
  const marginScore = Math.min(40, Math.max(0, marginRate));
  const probabilityScore = Math.min(30, Math.max(0, probability) * 0.3);
  const budgetScore = clientBudget > 0 ? Math.min(30, (clientBudget / Math.max(recommendedPrice, 1)) * 30) : 15;

  return Math.round(Math.min(100, marginScore + probabilityScore + budgetScore));
}

export function getQuoteHealthScore({
  marginRate,
  marketGapToMedian,
  clientBudget,
  recommendedPrice,
}: {
  marginRate: number;
  marketGapToMedian?: number | null;
  clientBudget?: number | null;
  recommendedPrice: number;
}) {
  const marginScore = Math.min(45, Math.max(0, marginRate) * 1.2);
  const gap = typeof marketGapToMedian === 'number' ? Math.abs(marketGapToMedian) : 0;
  const marketScore = Math.max(0, 35 - Math.min(35, gap * 0.7));
  const budgetScore =
    clientBudget && clientBudget > 0 ? Math.max(0, Math.min(20, (clientBudget / Math.max(recommendedPrice, 1)) * 20)) : 10;

  return Math.round(Math.min(100, marginScore + marketScore + budgetScore));
}

export function getQuoteHealthLabel(score: number) {
  if (score >= 75) {
    return 'Devis solide';
  }

  if (score >= 55) {
    return 'Devis a surveiller';
  }

  return 'Devis risque';
}
