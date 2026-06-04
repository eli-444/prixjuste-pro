'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, ClipboardList, CreditCard, FileText, LayoutDashboard, Settings, UserCircle } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/opportunites', label: 'Opportunités', icon: BarChart3 },
  { href: '/dashboard/devis', label: 'Devis', icon: FileText },
  { href: '/dashboard/suivi-demarches', label: 'Suivi démarches', icon: ClipboardList },
  { href: '/dashboard/facturation', label: 'Facturation', icon: CreditCard },
  { href: '/dashboard/mon-compte', label: 'Mon compte', icon: UserCircle },
  { href: '/dashboard/parametre', label: 'Paramètre', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeItem = [...items]
    .reverse()
    .find((item) => (item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href))) ?? items[0];

  return (
    <>
      <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <label htmlFor="dashboard-mobile-nav" className="sr-only">
          Navigation dashboard
        </label>
        <select
          id="dashboard-mobile-nav"
          value={activeItem.href}
          onChange={(event) => router.push(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-950 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        >
          {items.map((item) => (
            <option key={item.href} value={item.href}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-brand-900 text-white lg:block">
        <nav className="space-y-1 px-3 py-4 text-sm font-semibold">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                  isActive ? 'bg-brand-600 text-white shadow-glow' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

