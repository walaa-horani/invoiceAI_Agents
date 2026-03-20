'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await insforge.auth.signInWithPassword({ email, password }) as any;
    if (error) {
      setError(error.message || 'Invalid credentials. Please try again.');
      setLoading(false);
      return;
    }
    if (data?.user) {
      setUser(data.user);
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-headline font-black text-on-surface tracking-tight">FinAtelier</h1>
            <p className="text-xs text-on-surface-variant font-medium">Premium Billing</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-surface-container-highest shadow-sm">
          <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-1">Welcome back</h2>
          <p className="text-on-surface-variant text-sm mb-8">Sign in to your workspace</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-error bg-error-container px-4 py-3 rounded-lg font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            No account?{' '}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Create workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
