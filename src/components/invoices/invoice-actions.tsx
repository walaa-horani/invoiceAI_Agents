'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Mail, CheckCircle2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import { Invoice } from '@/lib/types';

export function InvoiceActions({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    insforge.database
      .from('invoices')
      .select('id, invoice_number, total_amount, status, clients(name, email)')
      .eq('id', invoiceId)
      .single()
      .then(({ data }) => {
        if (data) {
          const inv = data as unknown as Invoice;
          setInvoice(inv);
          setMarked(inv.status === 'paid');
        }
      });
  }, [invoiceId]);

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/emails/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch (e) {
      console.error('[send-invoice]', e);
    } finally {
      setSending(false);
    }
  };

  const handleMarkPaid = async () => {
    setMarking(true);
    try {
      await insforge.database
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId);

      // Send receipt in parallel — don't block UI on it
      fetch('/api/emails/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      }).catch((e) => console.error('[send-receipt]', e));

      setMarked(true);
      setInvoice((prev) => prev ? { ...prev, status: 'paid' } : prev);
    } catch (e) {
      console.error('[mark-paid]', e);
    } finally {
      setMarking(false);
    }
  };

  const handlePayOnline = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('[pay-online]', data.error);
      }
    } catch (e) {
      console.error('[pay-online]', e);
    } finally {
      setPaying(false);
    }
  };

  const isPaid = marked || invoice?.status === 'paid';
  const hasClient = !!invoice?.clients;

  return (
    <div className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 no-print">
      <div>
        <Link
          href="/invoices"
          className="text-primary font-medium flex items-center gap-2 mb-2 text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>
        <h2 className="text-3xl font-headline font-extrabold text-on-surface">
          {invoice?.invoice_number ?? `Invoice #${invoiceId.slice(0, 8)}…`}
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Download PDF */}
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-surface-container border border-outline-variant text-on-surface-variant font-semibold rounded-lg flex items-center gap-2 hover:bg-surface-variant transition-colors text-sm"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>

        {/* Send via Email */}
        <button
          onClick={handleSendEmail}
          disabled={sending || sent || !hasClient}
          title={!hasClient ? 'No client email on record' : undefined}
          className="px-5 py-2.5 bg-surface-container border border-outline-variant text-on-surface-variant font-semibold rounded-lg flex items-center gap-2 hover:bg-surface-variant transition-colors text-sm disabled:opacity-60"
        >
          {sent
            ? <CheckCircle2 className="w-5 h-5 text-tertiary" />
            : <Mail className="w-5 h-5" />}
          {sent ? 'Email Sent!' : sending ? 'Sending…' : 'Send via Email'}
        </button>

        {/* Pay Online via Stripe */}
        {!isPaid && (
          <button
            onClick={handlePayOnline}
            disabled={paying}
            className="px-5 py-2.5 bg-[#635BFF] text-white font-semibold rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity text-sm disabled:opacity-60 shadow-lg shadow-[#635BFF]/10"
          >
            <CreditCard className="w-5 h-5 text-white/60" />
            {paying ? 'Redirecting…' : 'Pay Online'}
          </button>
        )}

        {/* Mark as Paid — also triggers receipt email */}
        <button
          onClick={handleMarkPaid}
          disabled={marking || isPaid}
          className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity text-sm disabled:opacity-60 shadow-lg shadow-primary/10"
        >
          <CheckCircle2 className="w-5 h-5 text-white/60" />
          {isPaid ? 'Paid — Receipt Sent' : marking ? 'Updating…' : 'Mark as Paid'}
        </button>
      </div>
    </div>
  );
}
