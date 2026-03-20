'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Wallet, MailCheck } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/context/AuthContext';

function VerifyForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await insforge.auth.verifyEmail({ email, otp }) as any;
    if (error) {
      setError(error.message || 'Invalid or expired code.');
      setLoading(false);
      return;
    }
    if (data?.user) {
      setUser(data.user);
    }
    if (data?.accessToken || data?.user) {
      router.push('/');
    }
  };

  const handleResend = async () => {
    await insforge.auth.resendVerificationEmail({ email });
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-8 border border-surface-container-highest shadow-sm">
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 bg-tertiary-container rounded-2xl flex items-center justify-center">
          <MailCheck className="w-7 h-7 text-tertiary" />
        </div>
      </div>
      <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-1 text-center">Check your inbox</h2>
      <p className="text-on-surface-variant text-sm mb-8 text-center">
        We sent a 6-digit code to{' '}
        <span className="font-bold text-on-surface">{email || 'your email'}</span>
      </p>

      <form onSubmit={handleVerify} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Verification Code</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-4 text-3xl text-center tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="000000"
          />
        </div>

        {error && (
          <p className="text-sm text-error bg-error-container px-4 py-3 rounded-lg font-medium">{error}</p>
        )}
        {resent && (
          <p className="text-sm text-tertiary bg-tertiary-container px-4 py-3 rounded-lg font-medium">
            Verification email resent!
          </p>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? 'Verifying…' : 'Verify Email'}
        </button>
      </form>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        Didn&apos;t receive it?{' '}
        <button onClick={handleResend} className="text-primary font-bold hover:underline">
          Resend code
        </button>
      </p>
      <p className="text-center text-sm text-on-surface-variant mt-3">
        <Link href="/login" className="text-primary font-bold hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-headline font-black text-on-surface tracking-tight">FinAtelier</h1>
            <p className="text-xs text-on-surface-variant font-medium">Premium Billing</p>
          </div>
        </div>
        <Suspense fallback={<div className="text-center text-on-surface-variant">Loading…</div>}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
