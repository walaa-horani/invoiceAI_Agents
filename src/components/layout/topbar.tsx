'use client';

import { Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const displayName = user?.profile?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-8 font-headline text-sm antialiased">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" size={16} />
          <input
            className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
            placeholder="Search invoices, clients..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-on-surface-variant hover:text-primary font-medium transition-colors">Support</button>
        <button className="relative text-on-surface-variant hover:bg-primary-container p-2 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <div className="h-8 w-px bg-outline/20"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface">{displayName}</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Premium Tier</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 ring-2 ring-primary-container flex items-center justify-center text-primary font-bold text-sm">
            {initials}
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-on-surface-variant hover:text-error hover:bg-error-container p-2 rounded-lg transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
