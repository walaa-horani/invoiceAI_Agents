import { NextRequest, NextResponse } from 'next/server';
import { resend, FROM } from '@/lib/resend';
import { overdueEmail } from '@/lib/email-templates';
import { insforge } from '@/lib/insforge';

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // SECURITY DEFINER function — returns overdue invoices without a sent notice
    const { data: invoices, error } = await insforge.database
      .rpc('get_overdue_invoices_for_notification');

    if (error) {
      console.error('[cron/overdue] RPC error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const rows = (invoices ?? []) as Array<{
      id: string;
      invoice_number: string;
      total_amount: number;
      due_date: string;
      client_email: string;
      client_name: string;
      days_overdue: number;
    }>;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const results: Array<{ invoiceId: string; status: string }> = [];

    for (const row of rows) {
      try {
        await resend.emails.send({
          from: FROM,
          to: [row.client_email],
          subject: `Invoice Overdue — ${row.invoice_number} (${row.days_overdue} days)`,
          html: overdueEmail({
            clientName: row.client_name,
            invoiceNumber: row.invoice_number,
            totalAmount: Number(row.total_amount),
            dueDate: row.due_date,
            daysOverdue: row.days_overdue,
            appUrl,
            invoiceId: row.id,
          }),
        });

        // Mark notice sent + flip status to 'overdue'
        await insforge.database.rpc('mark_overdue_sent', { invoice_id: row.id });

        results.push({ invoiceId: row.id, status: 'sent' });
      } catch (e) {
        console.error(`[cron/overdue] Failed for invoice ${row.id}:`, e);
        results.push({ invoiceId: row.id, status: 'failed' });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (err) {
    console.error('[cron/overdue]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
