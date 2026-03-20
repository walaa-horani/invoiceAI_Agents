import { NextRequest, NextResponse } from 'next/server';
import { resend, FROM } from '@/lib/resend';
import { invoiceEmail, InvoiceEmailData } from '@/lib/email-templates';
import { insforge } from '@/lib/insforge';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
    }

    // SECURITY DEFINER function bypasses RLS — safe for server routes with no user session
    const { data: rows, error } = await insforge.database
      .rpc('get_invoice_for_email', { p_invoice_id: invoiceId });

    if (error || !rows || (rows as unknown[]).length === 0) {
      console.error('[send-invoice] RPC error or not found:', error);
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

    if (!first.client_email) {
      return NextResponse.json({ error: 'Client email not found' }, { status: 400 });
    }

    const lineItems = typedRows
      .filter((r) => r.line_description !== null)
      .map((r) => ({
        description: r.line_description as string,
        quantity: Number(r.line_quantity),
        amount: Number(r.line_amount),
      }));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const emailData: InvoiceEmailData = {
      clientName: first.client_name,
      clientEmail: first.client_email,
      invoiceNumber: first.invoice_number,
      totalAmount: Number(first.total_amount),
      issueDate: first.issue_date,
      dueDate: first.due_date,
      lineItems,
      appUrl,
      invoiceId: first.id,
    };

    const { error: sendError } = await resend.emails.send({
      from: FROM,
      to: [first.client_email],
      subject: `Invoice ${first.invoice_number} from FinAtelier`,
      html: invoiceEmail(emailData),
    });

    if (sendError) {
      console.error('[send-invoice] Resend error:', sendError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[send-invoice]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
