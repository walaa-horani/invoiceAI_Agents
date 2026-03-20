'use client';

import { useEffect, useState } from 'react';
import { Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { insforge } from '@/lib/insforge';
import { Invoice, formatCurrency, formatDate } from '@/lib/types';

const PAGE_SIZE = 10;

interface Props {
  refreshKey?: number;
  onStatsRefresh?: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-secondary-container text-on-secondary-container',
    pending: 'bg-tertiary-container text-on-tertiary-container',
    overdue: 'bg-error-container text-on-error-container',
  };
  return (
    <span className={clsx('inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize', styles[status] || 'bg-surface-container-high text-on-surface')}>
      {status}
    </span>
  );
}

export function InvoicesTable({ refreshKey = 0, onStatsRefresh }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    insforge.database
      .from('invoices')
      .select('*, clients(name, initials)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
      .then(({ data, count }) => {
        setInvoices((data as Invoice[]) || []);
        setTotal(count || 0);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    await insforge.database.from('invoices').delete().eq('id', id);
    fetchInvoices();
    onStatsRefresh?.();
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/30 mt-8">
      <div className="bg-surface-container-lowest overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="text-on-surface-variant font-bold text-xs uppercase tracking-widest border-b border-outline-variant/30">
              <th className="py-5 px-6">Invoice #</th>
              <th className="py-5 px-6">Client Name</th>
              <th className="py-5 px-6">Due Date</th>
              <th className="py-5 px-6">Status</th>
              <th className="py-5 px-6 text-right">Amount</th>
              <th className="py-5 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-outline-variant/10">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="py-5 px-6">
                      <div className="h-4 bg-surface-container-high rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-on-surface-variant font-medium">
                  No invoices yet.{' '}
                  <Link href="/invoices/new" className="text-primary font-bold hover:underline">
                    Create your first invoice
                  </Link>
                </td>
              </tr>
            ) : (
              invoices.map((invoice, index) => {
                const initials = invoice.clients?.initials || invoice.clients?.name?.slice(0, 2).toUpperCase() || '??';
                return (
                  <tr
                    key={invoice.id}
                    className={clsx(
                      'group hover:bg-surface-container-low transition-colors',
                      index !== invoices.length - 1 ? 'border-b border-outline-variant/10' : ''
                    )}
                  >
                    <td className="py-5 px-6 font-bold text-on-surface-variant">{invoice.invoice_number}</td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center font-bold text-primary text-xs">
                          {initials}
                        </div>
                        <span className="font-bold text-on-surface">{invoice.clients?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-on-surface-variant">
                      {invoice.due_date ? formatDate(invoice.due_date) : '—'}
                    </td>
                    <td className="py-5 px-6">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="py-5 px-6 text-right font-bold text-on-surface tabular-nums">
                      {formatCurrency(Number(invoice.total_amount))}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="p-2 hover:bg-surface-container-highest rounded-lg text-primary transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="p-2 hover:bg-error-container rounded-lg text-error transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest border-t border-outline-variant/30">
        <p className="text-xs text-on-surface-variant font-bold">
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total} invoice{total !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={clsx(
                'w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-colors',
                page === p ? 'bg-primary text-white' : 'hover:bg-surface-container-high text-on-surface-variant'
              )}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
