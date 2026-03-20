'use client';

import { useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function CancelContent() {
  const params = useSearchParams();
  const invoiceId = params.get('invoice_id');

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-outline-variant p-10 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-9 h-9 text-red-500" />
        </div>
        <h1 className="text-2xl font-headline font-extrabold text-on-surface mb-2">
          Payment Cancelled
        </h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Your payment was not processed. You can try again at any time.
        </p>
        {invoiceId && (
          <Link
            href={`/invoices/${invoiceId}`}
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Back to Invoice
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense>
      <CancelContent />
    </Suspense>
  );
}
