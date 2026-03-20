// Shared inline styles — email clients strip <style> tags
const PRIMARY = '#a13a00';
const PRIMARY_LIGHT = '#fff1ec';
const TERTIARY = '#005f9d';
const ERROR = '#ba1a1a';
const ERROR_LIGHT = '#ffdad6';
const SUCCESS = '#1a6b3c';
const SUCCESS_LIGHT = '#d4edda';
const SURFACE = '#fff8f6';
const ON_SURFACE = '#261913';
const MUTED = '#5a4138';
const BORDER = '#e2bfb2';

const layout = (accentColor: string, accentBg: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FinAtelier</title>
</head>
<body style="margin:0;padding:0;background:${SURFACE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BORDER};">
          <!-- Colour stripe -->
          <tr><td style="height:4px;background:linear-gradient(90deg,${PRIMARY},#954827,${TERTIARY});"></td></tr>

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;background:${accentBg};">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${accentColor};border-radius:12px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:22px;font-weight:900;line-height:48px;">F</span>
                  </td>
                  <td style="padding-left:14px;vertical-align:middle;">
                    <div style="font-size:20px;font-weight:900;color:${ON_SURFACE};letter-spacing:-0.5px;">FinAtelier</div>
                    <div style="font-size:11px;color:${MUTED};font-weight:600;text-transform:uppercase;letter-spacing:1px;">Premium Billing</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr><td style="padding:32px 40px;">${content}</td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#f7ddd4;border-top:1px solid ${BORDER};text-align:center;">
              <p style="margin:0;font-size:12px;color:${MUTED};">
                Sent by <strong>FinAtelier</strong> · Premium Invoice Management
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:${MUTED};">
                If you have questions about this invoice, please reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

function lineItemsTable(items: Array<{ description: string; quantity: number; amount: number }>) {
  const rows = items
    .map(
      (li) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${ON_SURFACE};">${li.description}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${MUTED};text-align:center;">${li.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;font-weight:700;color:${ON_SURFACE};text-align:right;">${fmt(li.amount)}</td>
      </tr>`
    )
    .join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
      <tr>
        <th style="padding:8px 0;border-bottom:2px solid ${BORDER};font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${MUTED};text-align:left;font-weight:700;">Description</th>
        <th style="padding:8px 0;border-bottom:2px solid ${BORDER};font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${MUTED};text-align:center;font-weight:700;">Qty</th>
        <th style="padding:8px 0;border-bottom:2px solid ${BORDER};font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${MUTED};text-align:right;font-weight:700;">Amount</th>
      </tr>
      ${rows}
    </table>`;
}

function ctaButton(text: string, url: string, color = PRIMARY) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
      <tr>
        <td style="background:${color};border-radius:10px;padding:14px 28px;">
          <a href="${url}" style="color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;display:block;">${text}</a>
        </td>
      </tr>
    </table>`;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// ─── Templates ──────────────────────────────────────────────────────────────

export interface InvoiceEmailData {
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  totalAmount: number;
  issueDate: string;
  dueDate?: string;
  lineItems: Array<{ description: string; quantity: number; amount: number }>;
  appUrl: string;
  invoiceId: string;
}

export function invoiceEmail(d: InvoiceEmailData) {
  const content = `
    <h2 style="margin:0 0 6px;font-size:24px;font-weight:900;color:${ON_SURFACE};">Invoice Ready for Review</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};">Hi ${d.clientName}, please find your invoice details below.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${PRIMARY_LIGHT};border-radius:12px;padding:20px 24px;margin-bottom:8px;">
      <tr>
        <td>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:${PRIMARY};">Invoice Number</div>
          <div style="font-size:22px;font-weight:900;color:${ON_SURFACE};margin:4px 0 16px;">${d.invoiceNumber}</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:${MUTED};padding-bottom:4px;">Issue Date</td>
              <td style="font-size:13px;font-weight:600;color:${ON_SURFACE};text-align:right;">${fmtDate(d.issueDate)}</td>
            </tr>
            ${d.dueDate ? `<tr>
              <td style="font-size:13px;color:${MUTED};">Due Date</td>
              <td style="font-size:13px;font-weight:700;color:${PRIMARY};text-align:right;">${fmtDate(d.dueDate)}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>

    ${d.lineItems.length > 0 ? lineItemsTable(d.lineItems) : ''}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
      <tr>
        <td style="font-size:16px;font-weight:900;color:${ON_SURFACE};">Total Due</td>
        <td style="font-size:24px;font-weight:900;color:${PRIMARY};text-align:right;">${fmt(d.totalAmount)}</td>
      </tr>
    </table>

    ${ctaButton('View Invoice', `${d.appUrl}/invoices/${d.invoiceId}`)}

    <p style="margin:28px 0 0;font-size:13px;color:${MUTED};">
      If you have any questions, simply reply to this email. Thank you for your business.
    </p>`;

  return layout(PRIMARY, PRIMARY_LIGHT, content);
}

// ─────────────────────────────────────────────────────────────────────────────

export interface ReminderEmailData {
  clientName: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: string;
  appUrl: string;
  invoiceId: string;
}

export function reminderEmail(d: ReminderEmailData) {
  const content = `
    <div style="background:${PRIMARY_LIGHT};border-left:4px solid ${PRIMARY};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${PRIMARY};">Payment Reminder</div>
      <div style="font-size:15px;font-weight:600;color:${ON_SURFACE};margin-top:4px;">Due tomorrow — ${fmtDate(d.dueDate)}</div>
    </div>

    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:${ON_SURFACE};">Friendly Reminder</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};">
      Hi ${d.clientName}, this is a gentle reminder that invoice <strong>${d.invoiceNumber}</strong> is due <strong>tomorrow</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;border-radius:12px;padding:20px 24px;">
      <tr>
        <td style="font-size:13px;color:${MUTED};">Invoice</td>
        <td style="font-size:13px;font-weight:700;color:${ON_SURFACE};text-align:right;">${d.invoiceNumber}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:${MUTED};padding-top:8px;">Due Date</td>
        <td style="font-size:13px;font-weight:700;color:${PRIMARY};text-align:right;padding-top:8px;">${fmtDate(d.dueDate)}</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:900;color:${ON_SURFACE};padding-top:16px;border-top:1px solid ${BORDER};">Amount Due</td>
        <td style="font-size:20px;font-weight:900;color:${PRIMARY};text-align:right;padding-top:16px;border-top:1px solid ${BORDER};">${fmt(d.totalAmount)}</td>
      </tr>
    </table>

    ${ctaButton('View & Pay Invoice', `${d.appUrl}/invoices/${d.invoiceId}`)}`;

  return layout(PRIMARY, PRIMARY_LIGHT, content);
}

// ─────────────────────────────────────────────────────────────────────────────

export interface OverdueEmailData {
  clientName: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: string;
  daysOverdue: number;
  appUrl: string;
  invoiceId: string;
}

export function overdueEmail(d: OverdueEmailData) {
  const content = `
    <div style="background:${ERROR_LIGHT};border-left:4px solid ${ERROR};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${ERROR};">Action Required</div>
      <div style="font-size:15px;font-weight:600;color:${ON_SURFACE};margin-top:4px;">${d.daysOverdue} day${d.daysOverdue !== 1 ? 's' : ''} overdue</div>
    </div>

    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:${ON_SURFACE};">Invoice Overdue</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};">
      Hi ${d.clientName}, invoice <strong>${d.invoiceNumber}</strong> was due on ${fmtDate(d.dueDate)} and is now
      <strong style="color:${ERROR};">${d.daysOverdue} day${d.daysOverdue !== 1 ? 's' : ''} overdue</strong>.
      Please arrange payment at your earliest convenience.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${ERROR_LIGHT};border-radius:12px;padding:20px 24px;">
      <tr>
        <td style="font-size:13px;color:${MUTED};">Invoice</td>
        <td style="font-size:13px;font-weight:700;color:${ON_SURFACE};text-align:right;">${d.invoiceNumber}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:${MUTED};padding-top:8px;">Was Due</td>
        <td style="font-size:13px;font-weight:700;color:${ERROR};text-align:right;padding-top:8px;">${fmtDate(d.dueDate)}</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:900;color:${ON_SURFACE};padding-top:16px;border-top:1px solid ${BORDER};">Amount Overdue</td>
        <td style="font-size:20px;font-weight:900;color:${ERROR};text-align:right;padding-top:16px;border-top:1px solid ${BORDER};">${fmt(d.totalAmount)}</td>
      </tr>
    </table>

    ${ctaButton('Pay Now', `${d.appUrl}/invoices/${d.invoiceId}`, ERROR)}

    <p style="margin:28px 0 0;font-size:13px;color:${MUTED};">
      If you believe this is an error or have already sent payment, please disregard this notice or reply to let us know.
    </p>`;

  return layout(ERROR, ERROR_LIGHT, content);
}

// ─────────────────────────────────────────────────────────────────────────────

export interface ReceiptEmailData {
  clientName: string;
  invoiceNumber: string;
  totalAmount: number;
  paidDate: string;
  appUrl: string;
  invoiceId: string;
}

export function receiptEmail(d: ReceiptEmailData) {
  const content = `
    <div style="background:${SUCCESS_LIGHT};border-left:4px solid ${SUCCESS};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${SUCCESS};">Payment Confirmed</div>
      <div style="font-size:15px;font-weight:600;color:${ON_SURFACE};margin-top:4px;">Thank you for your prompt payment.</div>
    </div>

    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:${ON_SURFACE};">Payment Receipt</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};">
      Hi ${d.clientName}, we've received your payment for invoice <strong>${d.invoiceNumber}</strong>.
      This email serves as your official receipt.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${SUCCESS_LIGHT};border-radius:12px;padding:20px 24px;">
      <tr>
        <td style="font-size:13px;color:${MUTED};">Invoice</td>
        <td style="font-size:13px;font-weight:700;color:${ON_SURFACE};text-align:right;">${d.invoiceNumber}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:${MUTED};padding-top:8px;">Payment Date</td>
        <td style="font-size:13px;font-weight:700;color:${ON_SURFACE};text-align:right;padding-top:8px;">${fmtDate(d.paidDate)}</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:900;color:${ON_SURFACE};padding-top:16px;border-top:1px solid ${BORDER};">Amount Received</td>
        <td style="font-size:20px;font-weight:900;color:${SUCCESS};text-align:right;padding-top:16px;border-top:1px solid ${BORDER};">${fmt(d.totalAmount)}</td>
      </tr>
    </table>

    ${ctaButton('View Receipt', `${d.appUrl}/invoices/${d.invoiceId}`, SUCCESS)}

    <p style="margin:28px 0 0;font-size:13px;color:${MUTED};">
      We look forward to working with you again. Thank you for your business.
    </p>`;

  return layout(SUCCESS, SUCCESS_LIGHT, content);
}
