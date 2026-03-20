'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const invoiceId = params.get('invoice_id');

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-outline-variant p-10 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-headline font-extrabold text-on-surface mb-2">
          Payment Successful
        </h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Thank you! Your payment has been received and a receipt has been sent to your email.
        </p>
        {invoiceId && (
          <Link
            href={`/invoices/${invoiceId}`}
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            View Invoice
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
