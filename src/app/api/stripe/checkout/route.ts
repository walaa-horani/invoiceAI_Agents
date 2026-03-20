import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { insforge } from '@/lib/insforge';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
    }

    const { data: rows, error } = await insforge.database
      .rpc('get_invoice_for_email', { p_invoice_id: invoiceId });

    if (error || !rows || (rows as unknown[]).length === 0) {
      console.error('[stripe/checkout] RPC error or not found:', error);
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    type Row = {
      id: string;
      invoice_number: string;
      total_amount: number;
      issue_date: string;
      due_date?: string;
      client_name: string;
      client_email: string;
      line_description: string | null;
      line_quantity: number | null;
      line_amount: number | null;
    };

    const typedRows = rows as unknown as Row[];
    const first = typedRows[0];

    const lineItems = typedRows
      .filter((r) => r.line_description !== null)
      .map((r) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: r.line_description as string,
          },
          unit_amount: Math.round(Number(r.line_amount) / Number(r.line_quantity) * 100),
        },
        quantity: Number(r.line_quantity),
      }));

    // Fallback: if no line items, use the total amount
    if (lineItems.length === 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Invoice ${first.invoice_number}`,
          },
          unit_amount: Math.round(Number(first.total_amount) * 100),
        },
        quantity: 1,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: first.client_email,
      metadata: {
        invoice_id: first.id,
        invoice_number: first.invoice_number,
      },
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&invoice_id=${first.id}`,
      cancel_url: `${appUrl}/payment/cancel?invoice_id=${first.id}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
