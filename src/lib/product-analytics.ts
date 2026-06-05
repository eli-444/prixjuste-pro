'use client';

type ProductEventMetadata = Record<string, string | number | boolean | null | undefined>;

export function trackProductEvent(name: string, metadata: ProductEventMetadata = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = JSON.stringify({ name, metadata });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/events', new Blob([payload], { type: 'application/json' }));
    return;
  }

  void fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
    keepalive: true,
  });
}
