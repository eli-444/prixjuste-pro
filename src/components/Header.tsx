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
    <header className="sticky top-0 z-50 border-b border-brand-100/80 bg-white/90 shadow-sm backdrop-blur">
      <div className="flex w-full items-center justify-between px-3 py-2">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-slate-950">
          <Image src="/logo-nav.png" alt="Tarifly" width={1814} height={902} className="h-11 w-auto object-contain md:h-12" priority />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <Link href="/#fonctionnement" className="transition hover:text-brand-600">
            Méthode
          </Link>
          <Link href="/#cibles" className="transition hover:text-brand-600">
            Pour qui ?
          </Link>
          <Link href="/#tarifs" className="transition hover:text-brand-600">
            Tarifs
          </Link>
          <Link href={user ? '/dashboard' : '/connexion'} className="transition hover:text-brand-600">
            {user ? 'Dashboard' : 'Connexion'}
          </Link>
          <Link href={user ? '/outil' : '/connexion?redirect=/outil'} className="rounded-full bg-[linear-gradient(135deg,#061747_0%,#0878f2_55%,#11cfc2_100%)] px-4 py-2 text-white shadow-glow transition hover:brightness-110">
            Nouveau calcul
          </Link>
          {entitlement ? (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
              Premium
            </span>
          ) : null}
        </nav>

        <MobileNav isPremium={Boolean(entitlement)} isSignedIn={Boolean(user)} />
      </div>
    </header>
  );
}
