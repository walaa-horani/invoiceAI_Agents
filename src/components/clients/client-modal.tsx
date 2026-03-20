'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import { getInitials } from '@/lib/types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ClientModal({ isOpen, onClose, onSuccess }: ClientModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset form on close
      setName('');
      setEmail('');
      setAddress('');
      setError('');
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await insforge.database
      .from('clients')
      .insert([{ name, email, address, initials: getInitials(name) }]);

    if (error) {
      setError(error.message || 'Failed to save client.');
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
      <div
        className="bg-surface rounded-xl shadow-2xl w-full max-w-xl mx-auto overflow-hidden border border-surface-container-highest"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-8 py-6 flex justify-between items-center border-b border-surface-container-highest">
          <h3 className="text-xl font-extrabold font-headline">Register New Client</h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2">
                Full Client Name / Entity *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg focus:ring-2 focus:ring-primary/20 p-3 text-sm placeholder:text-outline/60 outline-none transition-all"
                placeholder="e.g. Acme Corp Inc."
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2">
                Billing Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg focus:ring-2 focus:ring-primary/20 p-3 text-sm placeholder:text-outline/60 outline-none transition-all"
                placeholder="accounting@client.com"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2">
                Full Billing Address
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg focus:ring-2 focus:ring-primary/20 p-3 text-sm placeholder:text-outline/60 outline-none transition-all"
                placeholder="Street, City, Country, ZIP"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-error bg-error-container px-4 py-3 rounded-lg font-medium">{error}</p>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors border border-surface-container-highest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-[2] py-3 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 hover:shadow-lg transition-all active:scale-95 shadow-primary/20 disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Save Client Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
