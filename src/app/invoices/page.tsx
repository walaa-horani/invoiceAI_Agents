'use client';

import { useState } from 'react';
import { Filter, Download, Zap } from 'lucide-react';
import Link from 'next/link';
import { InvoicesStats } from '@/components/invoices/invoices-stats';
import { InvoicesTable } from '@/components/invoices/invoices-table';

export default function InvoicesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Invoices</h2>
            <p className="text-on-surface-variant font-medium mt-1">Manage and track your professional billing</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-lg hover:bg-surface-container-highest transition-colors">
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-lg hover:bg-surface-container-highest transition-colors">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </header>

        <InvoicesStats refreshKey={refreshKey} />
        <InvoicesTable refreshKey={refreshKey} onStatsRefresh={refresh} />
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <Link
          href="/invoices/new"
          className="group flex items-center gap-3 bg-slate-950 text-white pl-4 pr-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <div className="bg-primary p-2 rounded-full">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">New Invoice</span>
        </Link>
      </div>
    </>
  );
}
