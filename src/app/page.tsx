'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Banknote,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
  ArrowRight,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import { Invoice, formatCurrency, formatDate } from '@/lib/types';

type MonthBar = { month: string; issuedPct: string; paidPct: string };

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-tertiary-container text-tertiary',
  pending: 'bg-primary-container text-primary',
  overdue: 'bg-error-container text-error',
};

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insforge.database
      .from('invoices')
      .select('*, clients(name, initials)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setInvoices((data as Invoice[]) || []);
        setLoading(false);
      });
  }, []);

  // Derived stats
  const totalRevenue = invoices.reduce((s, i) => s + Number(i.total_amount), 0);
  const paid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.total_amount), 0);
  const pending = invoices.filter((i) => i.status === 'pending').reduce((s, i) => s + Number(i.total_amount), 0);
  const overdue = invoices.filter((i) => i.status === 'overdue');
  const recent = invoices.slice(0, 5);

  // Monthly velocity (last 6 months)
  const monthBars: MonthBar[] = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthInvoices = invoices.filter((inv) => {
        const date = new Date(inv.issue_date);
        return date.getMonth() === month && date.getFullYear() === year;
      });
      const issued = monthInvoices.length;
      const paidCount = monthInvoices.filter((inv) => inv.status === 'paid').length;
      const issuedPct = issued > 0 ? `${Math.min(100, (issued / Math.max(...invoices.map(() => 1), 1)) * 100 + 20)}%` : '8%';
      const paidPct = issued > 0 ? `${Math.round((paidCount / issued) * 100)}%` : '0%';
      return { month: label, issuedPct, paidPct };
    });
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-on-surface-variant font-medium">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="md:col-span-2 bg-surface-container-low p-8 rounded-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-secondary font-bold text-sm mb-2 uppercase tracking-wide">Total Projected Revenue</p>
            <h2 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface tabular-nums">
              {formatCurrency(totalRevenue)}
            </h2>
            <div className="mt-6 flex items-center gap-2 text-primary font-extrabold">
              <TrendingUp size={20} />
              <span>{invoices.length} invoices total</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Banknote size={192} className="text-primary" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline/5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-tertiary-container p-2 rounded-lg text-tertiary">
                <CheckCircle size={20} />
              </div>
              <span className="text-[10px] font-extrabold text-tertiary bg-tertiary-container/50 px-2 py-1 rounded">PAID</span>
            </div>
            <p className="text-on-surface-variant text-sm font-medium">Collected</p>
          </div>
          <p className="font-headline text-2xl font-bold text-on-surface tabular-nums">{formatCurrency(paid)}</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline/5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary-container p-2 rounded-lg text-primary">
                <Clock size={20} />
              </div>
              <span className="text-[10px] font-extrabold text-primary bg-primary-container/50 px-2 py-1 rounded">PENDING</span>
            </div>
            <p className="text-on-surface-variant text-sm font-medium">In Pipeline</p>
          </div>
          <p className="font-headline text-2xl font-bold text-on-surface tabular-nums">{formatCurrency(pending)}</p>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Monthly Velocity Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline/5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline text-lg font-extrabold">Monthly Invoicing Velocity</h3>
              <p className="text-on-surface-variant text-sm">Volume of issued vs paid invoices</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                <div className="w-3 h-3 rounded-sm bg-surface-container-high" />
                Issued
              </div>
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium ml-2">
                <div className="w-3 h-3 rounded-sm bg-primary/60" />
                Paid
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end gap-3 px-2">
            {monthBars.map((col, i) => (
              <div key={i} className="flex-1 bg-surface-container rounded-t-lg group relative" style={{ height: col.issuedPct }}>
                <div
                  className="absolute inset-x-0 bottom-0 bg-primary/40 rounded-t-lg group-hover:bg-primary transition-all"
                  style={{ height: col.paidPct }}
                />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-on-surface-variant/60">
                  {col.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Panel */}
        <div className="bg-surface-container-low rounded-xl p-8 flex flex-col border border-outline/5">
          <div className="flex items-center gap-2 text-error font-extrabold mb-6">
            <AlertTriangle size={20} />
            <h3 className="font-headline uppercase tracking-widest text-xs">Overdue Notice</h3>
          </div>
          <div className="flex-1 space-y-4">
            {overdue.length === 0 ? (
              <p className="text-sm text-on-surface-variant font-medium py-4 text-center">No overdue invoices</p>
            ) : (
              overdue.slice(0, 3).map((inv) => {
                const daysOverdue = inv.due_date
                  ? Math.max(0, Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000))
                  : 0;
                return (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="block p-4 bg-surface-container-lowest rounded-lg border-l-4 border-error shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-[10px] font-extrabold text-on-surface-variant/60 uppercase tracking-tighter mb-1">
                      {inv.invoice_number} — {inv.clients?.name || 'Unknown'}
                    </p>
                    <p className="font-headline text-lg font-bold text-on-surface tabular-nums">
                      {formatCurrency(Number(inv.total_amount))}
                    </p>
                    <p className="text-[10px] text-error mt-2 font-bold">{daysOverdue} DAYS OVERDUE</p>
                  </Link>
                );
              })
            )}
          </div>
          <Link
            href="/invoices"
            className="w-full mt-6 py-3 text-sm font-bold border-2 border-primary/20 text-primary hover:bg-primary-container rounded-lg transition-colors text-center block"
          >
            Review All Overdue
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline/5">
        <div className="p-8 border-b border-surface-container-low flex justify-between items-center">
          <h3 className="font-headline text-xl font-extrabold tracking-tight">Recent Activity</h3>
          <Link href="/invoices" className="text-primary text-sm font-extrabold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-extrabold text-on-surface-variant/60 uppercase tracking-widest bg-surface-container-low/50">
                <th className="px-8 py-4">Client</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Issue Date</th>
                <th className="px-8 py-4 text-right">Amount</th>
                <th className="px-8 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant font-medium">
                    No invoices yet.{' '}
                    <Link href="/invoices/new" className="text-primary font-bold hover:underline">
                      Create your first invoice
                    </Link>
                  </td>
                </tr>
              ) : (
                recent.map((inv) => {
                  const initials = inv.clients?.initials || inv.clients?.name?.slice(0, 2).toUpperCase() || '??';
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-surface-container-low/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center font-bold text-primary text-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{inv.clients?.name || 'Unknown Client'}</p>
                            <p className="text-[10px] text-on-surface-variant/60 font-bold">{inv.invoice_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${STATUS_COLORS[inv.status] || 'bg-surface-container-high text-on-surface'}`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-on-surface-variant font-medium">
                        {formatDate(inv.issue_date)}
                      </td>
                      <td className="px-8 py-6 text-right font-headline font-extrabold text-on-surface tabular-nums">
                        {formatCurrency(Number(inv.total_amount))}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="p-2 opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-primary transition-all inline-block"
                        >
                          <MoreVertical size={20} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile FAB */}
      <Link
        href="/invoices/new"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center z-50"
      >
        <Plus size={24} />
      </Link>
    </>
  );
}
