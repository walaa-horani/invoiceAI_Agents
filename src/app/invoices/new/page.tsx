'use client';

import { useState } from 'react';
import { ChevronRight, User, Calendar, FileText, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { getInitials, formatCurrency } from '@/lib/types';

type LineItemForm = {
  _key: number;
  description: string;
  quantity: number;
  unit_price: number;
};

let _keyCounter = 2;

const DEFAULT_ITEMS: LineItemForm[] = [
  { _key: 0, description: 'UX/UI Design Retainer - Monthly', quantity: 1, unit_price: 2500 },
  { _key: 1, description: 'Additional Revision Cycles', quantity: 2, unit_price: 150 },
];

export default function CreateInvoicePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Client fields
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Invoice meta
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Line items
  const [items, setItems] = useState<LineItemForm[]>(DEFAULT_ITEMS);

  const updateItem = (key: number, field: keyof LineItemForm, value: string | number) => {
    setItems((prev) =>
      prev.map((it) => (it._key === key ? { ...it, [field]: value } : it))
    );
  };

  const addRow = () => {
    setItems((prev) => [...prev, { _key: _keyCounter++, description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeRow = (key: number) => {
    setItems((prev) => prev.filter((it) => it._key !== key));
  };

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);

  const handleSubmit = async () => {
    if (!clientName || !clientEmail) {
      setError('Client name and email are required.');
      return;
    }
    if (items.length === 0 || items.some((it) => !it.description)) {
      setError('All line items need a description.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      // 1. Upsert client by email
      let clientId: string | null = null;
      const { data: existingClients } = await insforge.database
        .from('clients')
        .select('id')
        .eq('email', clientEmail)
        .limit(1);

      if (existingClients && existingClients.length > 0) {
        clientId = (existingClients[0] as { id: string }).id;
        // Update client info
        await insforge.database
          .from('clients')
          .update({ name: clientName, address: clientAddress, initials: getInitials(clientName) })
          .eq('id', clientId);
      } else {
        const { data: newClient } = await insforge.database
          .from('clients')
          .insert([{ name: clientName, email: clientEmail, address: clientAddress, initials: getInitials(clientName) }])
          .select('id')
          .single();
        clientId = (newClient as { id: string } | null)?.id || null;
      }

      // 2. Insert invoice
      const { data: newInvoice } = await insforge.database
        .from('invoices')
        .insert([
          {
            client_id: clientId,
            invoice_number: invoiceNumber,
            status: 'pending',
            issue_date: issueDate,
            due_date: dueDate || null,
            notes: notes || null,
            total_amount: subtotal,
          },
        ])
        .select('id')
        .single();

      const invoiceId = (newInvoice as { id: string } | null)?.id;
      if (!invoiceId) throw new Error('Failed to create invoice.');

      // 3. Batch insert line items
      await insforge.database.from('line_items').insert(
        items.map((it) => ({
          invoice_id: invoiceId,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          amount: it.quantity * it.unit_price,
        }))
      );

      router.push(`/invoices/${invoiceId}`);
    } catch (err) {
      setError((err as Error).message || 'An error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <nav className="flex items-center text-sm font-medium text-on-surface-variant mb-2 gap-2">
            <Link href="/invoices" className="hover:underline">Invoices</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary">Create New Invoice</span>
          </nav>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Create Invoice</h2>
        </div>
        <div className="flex gap-3">
          <Link
            href="/invoices"
            className="px-6 py-2.5 rounded-lg border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-all"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-60"
          >
            {submitting ? 'Generating…' : 'Generate Invoice'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-5 py-4 bg-error-container text-error rounded-xl font-medium text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Client Details */}
        <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary fill-primary/20" />
            <h3 className="font-headline font-bold text-lg text-on-surface">Client Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1 space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">Client Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="col-span-2 md:col-span-1 space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">Email Address *</label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="billing@acme.com"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">Billing Address</label>
              <textarea
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="123 Business Way, Suite 400, New York, NY"
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* Invoice Meta */}
        <section className="col-span-12 lg:col-span-4 bg-surface-container-highest/40 rounded-xl p-8 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-primary" />
            <h3 className="font-headline font-bold text-lg text-on-surface">Invoice Details</h3>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">Invoice #</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Line Items */}
        <section className="col-span-12 bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm">
          <div className="p-8 pb-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary fill-primary/20" />
                <h3 className="font-headline font-bold text-lg text-on-surface">Line Items</h3>
              </div>
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-2 text-primary font-bold text-sm px-4 py-2 hover:bg-primary/5 rounded-lg transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Add Row
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                  <th className="px-8 py-4">Description</th>
                  <th className="px-4 py-4 w-24 text-center">Qty</th>
                  <th className="px-4 py-4 w-40 text-right">Unit Price</th>
                  <th className="px-8 py-4 w-40 text-right">Total</th>
                  <th className="px-4 py-4 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {items.map((it) => (
                  <tr key={it._key}>
                    <td className="px-8 py-5">
                      <input
                        type="text"
                        value={it.description}
                        onChange={(e) => updateItem(it._key, 'description', e.target.value)}
                        className="w-full bg-transparent border-none p-0 focus:ring-0 font-medium outline-none"
                        placeholder="Item description"
                      />
                    </td>
                    <td className="px-4 py-5">
                      <input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => updateItem(it._key, 'quantity', Number(e.target.value))}
                        className="w-full bg-surface-container-low border-none rounded py-1 px-2 text-center outline-none"
                      />
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-on-surface-variant">$</span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={it.unit_price}
                          onChange={(e) => updateItem(it._key, 'unit_price', Number(e.target.value))}
                          className="w-28 bg-surface-container-low border-none rounded py-1 px-2 text-right outline-none"
                        />
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-on-surface tabular-nums">
                      {formatCurrency(it.quantity * it.unit_price)}
                    </td>
                    <td className="px-4 py-5 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(it._key)}
                          className="p-1 text-on-surface-variant hover:text-error transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Summary */}
        <div className="col-span-12 lg:col-start-8 lg:col-span-5 mt-4">
          <div className="bg-primary/5 rounded-2xl p-8 border-2 border-primary/10">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-on-surface-variant font-medium">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="h-px bg-primary/20 my-4" />
              <div className="flex justify-between items-center">
                <span className="font-headline font-extrabold text-xl text-on-surface">Total Amount</span>
                <span className="font-headline font-extrabold text-2xl text-primary tabular-nums">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="col-span-12 lg:col-start-1 lg:col-span-7 lg:row-start-3">
          <div className="bg-surface-container-low rounded-xl p-8 h-full">
            <label className="block text-sm font-bold text-on-surface mb-3">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-outline-variant/30 rounded-lg p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Payment terms, bank details, or a thank you message…"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
