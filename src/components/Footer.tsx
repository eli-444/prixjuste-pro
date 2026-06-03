import Link from 'next/link';
import { CookiePreferencesButton } from './CookiePreferencesButton';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-slate-600 md:grid-cols-3">
        <div>
          <p className="font-semibold text-slate-950">Tarifly</p>
          <p className="mt-2 max-w-sm">
            Un outil professionnel pour fixer des prix rentables, coherents et plus faciles a defendre.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/outil" className="hover:text-slate-950">
            Calculateur
          </Link>
          <Link href="/dashboard" className="hover:text-slate-950">
            Mon compte
          </Link>
          <Link href="/mentions-legales" className="hover:text-slate-950">
            Mentions legales
          </Link>
          <Link href="/conditions" className="hover:text-slate-950">
            Conditions
          </Link>
          <Link href="/confidentialite" className="hover:text-slate-950">
            Confidentialite & cookies
          </Link>
          <CookiePreferencesButton />
        </div>
        <p className="md:text-right">© {new Date().getFullYear()} Tarifly. Tous droits reserves.</p>
      </div>
    </footer>
  );
}
