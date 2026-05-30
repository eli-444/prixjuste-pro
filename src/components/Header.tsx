import Image from 'next/image';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MobileNav } from './MobileNav';

export async function Header() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: entitlement } =
    user && supabase
      ? await supabase
          .from('premium_entitlements')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle()
      : { data: null };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-slate-950">
          <Image src="/logo.png" alt="Tarifly" width={320} height={116} className="h-20 w-auto object-contain md:h-24" priority />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/#fonctionnement" className="hover:text-slate-950">
            Methode
          </Link>
          <Link href="/#cibles" className="hover:text-slate-950">
            Pour qui ?
          </Link>
          <Link href="/#tarifs" className="hover:text-slate-950">
            Tarifs
          </Link>
          <Link href="/opportunites" className="hover:text-slate-950">
            Opportunites
          </Link>
          <Link href={user ? '/mon-compte' : '/connexion'} className="hover:text-slate-950">
            {user ? 'Mon compte' : 'Connexion'}
          </Link>
          {entitlement ? (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
              Premium
            </span>
          ) : null}
          <Link href="/outil" className="rounded-full bg-slate-950 px-4 py-2 text-white hover:bg-slate-800">
            Calculer un prix
          </Link>
        </nav>

        <MobileNav isPremium={Boolean(entitlement)} isSignedIn={Boolean(user)} />
      </div>
    </header>
  );
}
