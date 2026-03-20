import { NextRequest, NextResponse } from 'next/server';
import { resend, FROM } from '@/lib/resend';
import { reminderEmail } from '@/lib/email-templates';
import { insforge } from '@/lib/insforge';

// Secured with CRON_SECRET — set the same value in Vercel → Settings → Environment Variables
function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev mode: allow unauthenticated
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // SECURITY DEFINER function bypasses RLS — returns all invoices due tomorrow
    const { data: invoices, error } = await insforge.database
      .rpc('get_invoices_due_tomorrow');

    if (error) {
      console.error('[cron/reminders] RPC error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const rows = (invoices ?? []) as Array<{
      id: string;
      invoice_number: string;
      total_amount: number;
      due_date: string;
      client_email: string;
      client_name: string;
    }>;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const results: Array<{ invoiceId: string; status: string }> = [];

    for (const row of rows) {
      try {
        await resend.emails.send({
          from: FROM,
          to: [row.client_email],
          subject: `Payment Due Tomorrow — ${row.invoice_number}`,
          html: reminderEmail({
            clientName: row.client_name,
            invoiceNumber: row.invoice_number,
            totalAmount: Number(row.total_amount),
            dueDate: row.due_date,
            appUrl,
            invoiceId: row.id,
          }),
        });

        // Mark as sent so we don't resend
        await insforge.database.rpc('mark_reminder_sent', { invoice_id: row.id });

        results.push({ invoiceId: row.id, status: 'sent' });
      } catch (e) {
        console.error(`[cron/reminders] Failed for invoice ${row.id}:`, e);
        results.push({ invoiceId: row.id, status: 'failed' });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (err) {
    console.error('[cron/reminders]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
