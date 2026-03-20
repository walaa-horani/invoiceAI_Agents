'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Plus
} from 'lucide-react';
import clsx from 'clsx';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r-0 bg-slate-950 dark:bg-black shadow-2xl flex flex-col py-6 z-50 overflow-y-auto no-scrollbar">
      <div className="px-6 mb-10">
        <h1 className="text-2xl font-bold tracking-tighter text-white font-headline">FinAtelier</h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-tight">Premium Billing</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 font-headline text-sm font-medium tracking-tight transition-all duration-200 rounded-lg group",
                isActive 
                  ? "text-white bg-primary/20 shadow-sm shadow-primary/5" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon 
                size={20} 
                className={clsx(
                  "transition-colors",
                  isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
                )} 
              />
              {link.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-glow shadow-primary/20" />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="px-4 mt-auto">
        <Link href="/invoices/new" className="w-full bg-primary text-on-primary py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all hover:bg-orange-500">
          <Plus size={20} />
          Create Invoice
        </Link>
      </div>
    </aside>
  );
}

