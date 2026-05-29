export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100) / 100} %`;
}
