'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './sidebar';
import TopBar from './topbar';

const AUTH_PATHS = ['/login', '/signup', '/verify'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (loading) return;
    if (!user && !isAuthPage) {
      router.replace('/login');
    } else if (user && isAuthPage) {
      router.replace('/');
    }
  }, [user, loading, isAuthPage, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl animate-pulse" />
          <p className="text-on-surface-variant text-sm font-medium">Loading FinAtelier…</p>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!user) return null;

  return (
    <>
      <Sidebar />
      <TopBar />
      <main className="ml-64 pt-24 pb-12 px-8 min-h-screen bg-surface">
        {children}
      </main>
    </>
  );
}
