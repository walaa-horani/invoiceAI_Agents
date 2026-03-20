'use client';

import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';
import { formatCurrency } from '@/lib/types';

interface Props {
  refreshKey?: number;
}

export function ClientsStats({ refreshKey = 0 }: Props) {
  const [clientCount, setClientCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      insforge.database.from('clients').select('id', { count: 'exact', head: true }),
      insforge.database.from('invoices').select('total_amount, status'),
    ]).then(([clientsRes, invoicesRes]) => {
      setClientCount(clientsRes.count || 0);
      const invoices = (invoicesRes.data as { total_amount: number; status: string }[]) || [];
      const revenue = invoices
        .filter((i) => i.status === 'paid')
        .reduce((s, i) => s + Number(i.total_amount), 0);
      const pending = invoices.filter((i) => i.status === 'pending').length;
      setTotalRevenue(revenue);
      setPendingCount(pending);
      setLoading(false);
    });
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[1, 2, 3].map((k) => (
          <div key={k} className="bg-surface-container-low p-6 rounded-xl border border-surface-container-highest animate-pulse h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="bg-surface-container-low p-6 rounded-xl border border-surface-container-highest">
        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-4">Total Clients</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tabular-nums">{clientCount}</span>
          <span className="text-primary text-xs font-bold bg-primary-container px-2 py-0.5 rounded-full">Active</span>
        </div>
      </div>
      <div className="bg-surface-container-low p-6 rounded-xl border border-surface-container-highest">
        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-4">Total Collected</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tabular-nums">{formatCurrency(totalRevenue)}</span>
        </div>
      </div>
      <div className="bg-surface-container-low p-6 rounded-xl border border-surface-container-highest">
        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-4">Pending Invoices</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tabular-nums">{pendingCount}</span>
          <span className="text-on-secondary-container text-xs font-bold bg-secondary-container px-2 py-0.5 rounded-full">Open</span>
        </div>
      </div>
    </div>
  );
}
