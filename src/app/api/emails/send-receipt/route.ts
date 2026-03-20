import { NextRequest, NextResponse } from 'next/server';
import { resend, FROM } from '@/lib/resend';
import { receiptEmail, ReceiptEmailData } from '@/lib/email-templates';
import { insforge } from '@/lib/insforge';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
    }

    // SECURITY DEFINER function bypasses RLS — safe for server routes with no user session
    const { data: rows, error } = await insforge.database
      .rpc('get_invoice_for_receipt', { p_invoice_id: invoiceId });

    if (error || !rows || (rows as unknown[]).length === 0) {
      console.error('[send-receipt] RPC error or not found:', error);
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    type Row = {
      id: string;
      invoice_number: string;
      total_amount: number;
      client_name: string;
      client_email: string;
    };

    const inv = (rows as unknown as Row[])[0];

    if (!inv.client_email) {
      return NextResponse.json({ error: 'Client email not found' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const emailData: ReceiptEmailData = {
      clientName: inv.client_name,
      invoiceNumber: inv.invoice_number,
      totalAmount: Number(inv.total_amount),
      paidDate: new Date().toISOString(),
      appUrl,
      invoiceId: inv.id,
    };

    const { error: sendError } = await resend.emails.send({
      from: FROM,
      to: [inv.client_email],
      subject: `Payment Received — ${inv.invoice_number}`,
      html: receiptEmail(emailData),
    });

    if (sendError) {
      console.error('[send-receipt] Resend error:', sendError);
      return NextResponse.json({ error: 'Failed to send receipt' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[send-receipt]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
