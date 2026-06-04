export function getQuoteExpirationDate(createdAt: string | null, validityDays: number | null) {
  const start = createdAt ? new Date(createdAt) : new Date();
  const days = Number.isFinite(Number(validityDays)) ? Math.max(1, Number(validityDays)) : 30;
  const expiresAt = new Date(start);
  expiresAt.setDate(expiresAt.getDate() + days);

  return expiresAt;
}

export function isQuoteExpired(createdAt: string | null, validityDays: number | null) {
  return getQuoteExpirationDate(createdAt, validityDays).getTime() < Date.now();
}

export function isFinalQuoteStatus(status: string | null | undefined) {
  return status === 'accepted' || status === 'refused' || status === 'expired';
}
