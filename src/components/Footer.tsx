import Link from 'next/link';
import { CookiePreferencesButton } from './CookiePreferencesButton';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-slate-600 md:grid-cols-3">
        <div>
          <p className="font-black text-brand-900">Tarifly</p>
          <p className="mt-2 max-w-sm leading-6">
            Un SaaS professionnel pour calculer des prix rentables, comparer son tarif au marché, générer des devis et suivre les réponses clients.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/outil" className="hover:text-slate-950">
            Calculer un prix
          </Link>
          <Link href="/dashboard" className="hover:text-slate-950">
            Dashboard
          </Link>
          <Link href="/aide" className="hover:text-slate-950">
            Aide & support
          </Link>
          <Link href="/ressources" className="hover:text-slate-950">
            Ressources pricing
          </Link>
          <Link href="/metiers" className="hover:text-slate-950">
            Guides métiers
          </Link>
          <Link href="/mentions-legales" className="hover:text-slate-950">
            Mentions légales
          </Link>
          <Link href="/conditions" className="hover:text-slate-950">
            Conditions
          </Link>
          <Link href="/confidentialite" className="hover:text-slate-950">
            Confidentialité & cookies
          </Link>
          <CookiePreferencesButton />
        </div>
        <p className="md:text-right">© {new Date().getFullYear()} Tarifly. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
