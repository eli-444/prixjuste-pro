'use client';

import { LogOut } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export function SignOutButton({ className }: { className?: string }) {
  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.localStorage.removeItem('tarifly_premium');
    window.location.href = '/';
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className={
        className ??
        'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50'
      }
    >
      <LogOut size={16} />
      Se déconnecter
    </button>
  );
}

