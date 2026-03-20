import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('[Resend] RESEND_API_KEY is not set — emails will not be sent.');
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? 'missing');

export const FROM = process.env.RESEND_FROM_EMAIL ?? 'FinAtelier <onboarding@resend.dev>';
