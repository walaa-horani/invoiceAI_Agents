'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Upload, X } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import { UserSettings } from '@/lib/types';

interface Props {
  settings: Partial<UserSettings>;
  onChange: (patch: Partial<UserSettings>) => void;
}

export function CompanyProfile({ settings, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(settings.logo_url || null);

  useEffect(() => {
    setPreview(settings.logo_url || null);
  }, [settings.logo_url]);

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    const { data, error } = await insforge.storage.from('company-assets').uploadAuto(file);
    if (error || !data) {
      console.error('Logo upload failed:', error);
      setUploading(false);
      return;
    }
    setPreview(data.url);
    onChange({ logo_url: data.url, logo_key: data.key });
    setUploading(false);
  };

  const handleRemoveLogo = async () => {
    if (settings.logo_key) {
      await insforge.storage.from('company-assets').remove(settings.logo_key);
    }
    setPreview(null);
    onChange({ logo_url: undefined, logo_key: undefined });
  };

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-8 border border-surface-container-highest shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Company Profile</h3>
          <p className="text-sm text-on-surface-variant">Your business identity shown on invoices.</p>
        </div>
        <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          Verified Account
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Logo Upload */}
        <div className="col-span-1 md:col-span-2 flex items-center gap-8 pb-6 border-b border-surface-container-highest">
          <div className="relative group">
            <div
              className="w-24 h-24 rounded-2xl bg-surface-container-high flex items-center justify-center border-2 border-dashed border-outline overflow-hidden cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Company logo" className="w-full h-full object-contain" />
              ) : uploading ? (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <ImagePlus className="w-8 h-8 text-outline-variant group-hover:text-primary transition-colors" />
              )}
              {!uploading && (
                <div className="hidden group-hover:flex absolute inset-0 bg-primary/80 items-center justify-center text-white transition-all rounded-2xl">
                  <Upload className="w-6 h-6" />
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
              }}
            />
          </div>
          <div>
            <h4 className="font-bold text-on-surface text-sm mb-1">Company Logo</h4>
            <p className="text-xs text-on-surface-variant mb-3">Recommended size 400×400px. PNG or SVG preferred.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-60"
              >
                {uploading ? 'Uploading…' : 'Upload New'}
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-4 py-1.5 text-on-surface-variant text-xs font-bold hover:text-error transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-1.5 min-w-0">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Legal Business Name</label>
          <input
            type="text"
            value={settings.company_name || ''}
            onChange={(e) => onChange({ company_name: e.target.value })}
            className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="e.g. Lumina Ledger Inc."
          />
        </div>

        <div className="space-y-1.5 min-w-0">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Tax Identification Number</label>
          <input
            type="text"
            value={settings.tax_id || ''}
            onChange={(e) => onChange({ tax_id: e.target.value })}
            className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="e.g. EIN-1234567"
          />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-1.5 min-w-0">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Registered Office Address</label>
          <textarea
            rows={3}
            value={settings.billing_address || ''}
            onChange={(e) => onChange({ billing_address: e.target.value })}
            className="w-full bg-surface-container-low border border-surface-container-highest rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all block resize-y"
            placeholder="742 Evergreen Terrace, Springfield, OR 97403"
          />
        </div>
      </div>
    </section>
  );
}
