'use client';

import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import { Invoice, formatCurrency, formatDate } from '@/lib/types';

export function InvoiceCard({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insforge.database
      .from('invoices')
      .select('*, clients(*), line_items(*)')
      .eq('id', invoiceId)
      .single()
      .then(({ data }) => {
        setInvoice(data as Invoice);
        setLoading(false);
      });
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden invoice-card animate-pulse">
        <div className="h-2 bg-gradient-to-r from-primary via-secondary to-tertiary" />
        <div className="p-12 space-y-8">
          <div className="h-8 bg-surface-container-high rounded w-48" />
          <div className="h-4 bg-surface-container-high rounded w-full" />
          <div className="h-4 bg-surface-container-high rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl p-12 text-center">
        <p className="text-on-surface-variant">Invoice not found.</p>
      </div>
    );
  }

  const lineItems = invoice.line_items || [];
  const subtotal = lineItems.reduce((s, li) => s + Number(li.amount), 0);
  const total = Number(invoice.total_amount);

  const statusColors: Record<string, string> = {
    paid: 'bg-tertiary-container text-tertiary',
    pending: 'bg-surface-container-high text-on-surface-variant',
    overdue: 'bg-error-container text-error',
  };

  return (
    <article className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden invoice-card relative">
      <div className="h-2 bg-gradient-to-r from-primary via-secondary to-tertiary" />

      <div className="p-8 sm:p-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-16 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-headline font-black text-on-surface tracking-tight">FinAtelier</h3>
              <p className="text-on-surface-variant text-sm">Professional Financial Services</p>
            </div>
          </div>
          <div className="sm:text-right">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${statusColors[invoice.status] || 'bg-surface-container-high text-on-surface-variant'}`}>
              {invoice.status}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-on-surface-variant">
                Invoice:{' '}
                <span className="text-on-surface font-semibold">{invoice.invoice_number}</span>
              </p>
              <p className="text-sm text-on-surface-variant">
                Issue Date:{' '}
                <span className="text-on-surface font-semibold">{formatDate(invoice.issue_date)}</span>
              </p>
              {invoice.due_date && (
                <p className="text-sm text-on-surface-variant">
                  Due Date:{' '}
                  <span className="text-on-surface font-semibold">{formatDate(invoice.due_date)}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Billing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-16">
          <div>
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Billed From</h4>
            <div className="text-on-surface space-y-1 text-sm">
              <p className="font-bold text-lg">FinAtelier Inc.</p>
              <p className="text-on-surface-variant">123 Business Avenue, Suite 500</p>
              <p className="text-on-surface-variant">San Francisco, CA 94107</p>
              <p className="text-on-surface-variant">billing@finatelier.com</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4">Billed To</h4>
            {invoice.clients ? (
              <div className="text-on-surface space-y-1 text-sm">
                <p className="font-bold text-lg">{invoice.clients.name}</p>
                {invoice.clients.address && (
                  <p className="text-on-surface-variant whitespace-pre-line">{invoice.clients.address}</p>
                )}
                <p className="text-on-surface-variant">{invoice.clients.email}</p>
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm">No client information</p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-12 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest w-12">#</th>
                <th className="text-left py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Description</th>
                <th className="text-right py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Rate</th>
                <th className="text-right py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Qty</th>
                <th className="text-right py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {lineItems.map((li, idx) => (
                <tr key={li.id}>
                  <td className="py-6 text-on-surface-variant align-top text-sm">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="py-6 align-top">
                    <p className="font-bold text-on-surface">{li.description}</p>
                  </td>
                  <td className="py-6 text-right text-on-surface align-top text-sm tabular-nums">
                    {formatCurrency(Number(li.unit_price))}
                  </td>
                  <td className="py-6 text-right text-on-surface align-top text-sm tabular-nums">{li.quantity}</td>
                  <td className="py-6 text-right font-bold text-on-surface align-top text-sm tabular-nums">
                    {formatCurrency(Number(li.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span className="font-semibold text-on-surface tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="pt-4 mt-2 border-t border-outline-variant flex justify-between">
              <span className="text-lg font-bold text-on-surface">Total Due</span>
              <span className="text-2xl font-black text-primary tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes / Footer */}
        {invoice.notes && (
          <div className="mt-12 pt-8 border-t border-surface-container-highest">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Notes</h4>
            <p className="text-sm text-on-surface-variant whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-surface-container-highest flex justify-end">
          <p className="text-xs text-on-surface-variant italic">
            Thank you for your business. We look forward to continuing our partnership.
          </p>
        </div>
      </div>

      <div className="h-16 bg-surface-container-low flex items-center px-12 justify-center opacity-50 relative overflow-hidden">
        <div className="flex gap-8">
          <div className="h-1 w-24 bg-primary/20 rounded-full" />
          <div className="h-1 w-12 bg-secondary/20 rounded-full" />
          <div className="h-1 w-32 bg-tertiary/20 rounded-full" />
        </div>
      </div>
    </article>
  );
}
