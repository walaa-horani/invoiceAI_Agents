'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import { Invoice, formatCurrency } from '@/lib/types';

interface Props {
  refreshKey?: number;
}

export function InvoicesStats({ refreshKey = 0 }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insforge.database
      .from('invoices')
      .select('status, total_amount, issue_date, due_date')
      .then(({ data }) => {
        setInvoices((data as Invoice[]) || []);
        setLoading(false);
      });
  }, [refreshKey]);

  const now = new Date();
  const thisMonth = (inv: Invoice) => {
    const d = new Date(inv.issue_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const outstanding = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .reduce((s, i) => s + Number(i.total_amount), 0);

  const paidThisMonth = invoices
    .filter((i) => i.status === 'paid' && thisMonth(i))
    .reduce((s, i) => s + Number(i.total_amount), 0);

  const paidCountThisMonth = invoices.filter((i) => i.status === 'paid' && thisMonth(i)).length;

  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((k) => (
          <div key={k} className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/30">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Outstanding</p>
        <h3 className="text-4xl font-extrabold font-headline text-primary tracking-tighter tabular-nums">
          {formatCurrency(outstanding)}
        </h3>
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-on-tertiary-container bg-tertiary-container px-2 py-1 rounded w-fit">
          <TrendingUp className="w-4 h-4" />
          Pending + Overdue
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/30">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Paid this Month</p>
        <h3 className="text-4xl font-extrabold font-headline text-on-surface tracking-tighter tabular-nums">
          {formatCurrency(paidThisMonth)}
        </h3>
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-on-secondary-container bg-secondary-container px-2 py-1 rounded w-fit">
          <CheckCircle2 className="w-4 h-4" />
          {paidCountThisMonth} Invoice{paidCountThisMonth !== 1 ? 's' : ''} Cleared
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/30">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Overdue Notices</p>
        <h3 className="text-4xl font-extrabold font-headline text-error tracking-tighter tabular-nums">
          {String(overdueCount).padStart(2, '0')}
        </h3>
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-on-error-container bg-error-container px-2 py-1 rounded w-fit">
          <AlertTriangle className="w-4 h-4" />
          {overdueCount > 0 ? 'Requires Attention' : 'All Clear'}
        </div>
      </div>
    </div>
  );
}
