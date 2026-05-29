'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './env';

export function createBrowserSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured || !url || !anonKey) {
    throw new Error('Supabase n est pas encore configure.');
  }

  return createBrowserClient(url, anonKey);
}
