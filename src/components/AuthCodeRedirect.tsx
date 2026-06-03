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

    window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent('/connexion')}`);
  }, []);

  return null;
}
