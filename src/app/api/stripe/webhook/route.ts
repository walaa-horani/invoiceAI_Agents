import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { insforge } from '@/lib/insforge';
import { resend, FROM } from '@/lib/resend';
import { receiptEmail } from '@/lib/email-templates';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    );
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const invoiceId = session.metadata?.invoice_id;

    if (!invoiceId) {
      console.error('[stripe/webhook] No invoice_id in metadata');
      return NextResponse.json({ error: 'Missing invoice_id' }, { status: 400 });
    }

    // Mark invoice as paid
    const { error: updateError } = await insforge.database
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('[stripe/webhook] Failed to update invoice:', updateError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    // Send receipt email
    try {
      const { data: inv } = await insforge.database
        .from('invoices')
        .select('invoice_number, total_amount, clients(name, email)')
        .eq('id', invoiceId)
        .single();

      if (inv) {
        const invoice = inv as unknown as {
          invoice_number: string;
          total_amount: number;
          clients: { name: string; email: string };
        };

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

        await resend.emails.send({
          from: FROM,
          to: [invoice.clients.email],
          subject: `Payment Receipt — ${invoice.invoice_number}`,
          html: receiptEmail({
            clientName: invoice.clients.name,
            invoiceNumber: invoice.invoice_number,
            totalAmount: Number(invoice.total_amount),
            paidDate: new Date().toISOString(),
            appUrl,
            invoiceId,
          }),
        });
      }
    } catch (e) {
      console.error('[stripe/webhook] Receipt email failed:', e);
    }

    console.log(`[stripe/webhook] Invoice ${invoiceId} marked as paid`);
  }

  return NextResponse.json({ received: true });
}
