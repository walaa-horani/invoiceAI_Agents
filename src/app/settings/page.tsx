'use client';

import { useEffect, useState } from 'react';
import { SettingsNav } from '@/components/settings/settings-nav';
import { CompanyProfile } from '@/components/settings/company-profile';
import { FinancialDefaults } from '@/components/settings/financial-defaults';
import { insforge } from '@/lib/insforge';
import { UserSettings } from '@/lib/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<UserSettings>>({ default_tax_rate: 0, base_currency: 'USD' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    insforge.database
      .from('settings')
      .select('*')
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(data as UserSettings);
        setLoading(false);
      });
  }, []);

  const handleChange = (patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Check if record exists
    const { data: existing } = await insforge.database
      .from('settings')
      .select('user_id')
      .maybeSingle();

    if (existing) {
      await insforge.database
        .from('settings')
        .update({
          company_name: settings.company_name,
          tax_id: settings.tax_id,
          billing_address: settings.billing_address,
          logo_url: settings.logo_url,
          logo_key: settings.logo_key,
          default_tax_rate: settings.default_tax_rate,
          base_currency: settings.base_currency,
        })
        .eq('user_id', (existing as { user_id: string }).user_id);
    } else {
      await insforge.database.from('settings').insert([
        {
          company_name: settings.company_name,
          tax_id: settings.tax_id,
          billing_address: settings.billing_address,
          logo_url: settings.logo_url,
          logo_key: settings.logo_key,
          default_tax_rate: settings.default_tax_rate ?? 0,
          base_currency: settings.base_currency ?? 'USD',
        },
      ]);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDiscard = () => {
    setLoading(true);
    insforge.database
      .from('settings')
      .select('*')
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(data as UserSettings);
        setLoading(false);
      });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight mb-2">Workspace Settings</h2>
        <p className="text-on-surface-variant max-w-2xl">
          Configure your company identity and global financial parameters. These defaults will be applied to all new invoices and client communications.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-pulse text-on-surface-variant font-medium">Loading settings…</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <SettingsNav />
          </div>

          <div className="md:col-span-9 space-y-8">
            <CompanyProfile settings={settings} onChange={handleChange} />
            <FinancialDefaults settings={settings} onChange={handleChange} />

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-surface-container-highest">
              {saved && (
                <p className="text-sm text-tertiary font-bold mr-auto">Settings saved successfully.</p>
              )}
              <button
                type="button"
                onClick={handleDiscard}
                className="w-full sm:w-auto px-8 py-3 text-on-surface-variant font-bold text-sm hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-10 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all shadow-primary/20 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save Workspace Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
