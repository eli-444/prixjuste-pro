'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, CreditCard, LayoutDashboard, Settings, UserCircle } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/opportunites', label: 'Opportunites', icon: BarChart3 },
  { href: '/dashboard/facturation', label: 'Facturation', icon: CreditCard },
  { href: '/dashboard/mon-compte', label: 'Mon compte', icon: UserCircle },
  { href: '/dashboard/parametre', label: 'Parametre', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
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
  );
}
