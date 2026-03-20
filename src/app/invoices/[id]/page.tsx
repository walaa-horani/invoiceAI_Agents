"use client";

import { use } from "react";
import { Printer } from "lucide-react";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { InvoiceCard } from "@/components/invoices/invoice-card";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  return (
    <>
      <InvoiceActions invoiceId={id} />
      <InvoiceCard invoiceId={id} />

      {/* Floating Action Button (for mobile experience reference) */}
      <button 
        onClick={() => window.print()}
        className="md:hidden fixed bottom-6 right-6 h-14 w-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center no-print"
      >
        <Printer className="w-6 h-6" />
      </button>
    </>
  );
}
