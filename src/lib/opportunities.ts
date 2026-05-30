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
};

export const defaultOpportunityMeta: OpportunityMeta = {
  title: '',
  clientName: '',
  status: 'to_price',
  probability: 50,
  deadline: '',
  clientBudget: 0,
  nextAction: '',
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
