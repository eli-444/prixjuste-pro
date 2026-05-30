'use client';

import { useEffect } from 'react';

export function AuthCodeRedirect() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const code = searchParams.get('code') ?? hashParams.get('code');

    if (!code) {
      return;
    }

    const next = encodeURIComponent('/modifier-mot-de-passe');
    window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}&next=${next}`);
  }, []);

  return null;
}
