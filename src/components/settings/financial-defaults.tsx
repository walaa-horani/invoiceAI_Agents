'use client';

import { Percent, CalendarDays, DollarSign } from 'lucide-react';
import { UserSettings } from '@/lib/types';

interface Props {
  settings: Partial<UserSettings>;
  onChange: (patch: Partial<UserSettings>) => void;
}

export function FinancialDefaults({ settings, onChange }: Props) {
  return (
    <section className="bg-surface-container-lowest rounded-2xl p-8 border border-surface-container-highest shadow-sm">
      <div className="mb-8">
        <h3 className="text-lg font-bold text-on-surface">Financial Defaults</h3>
        <p className="text-sm text-on-surface-variant">Automation rules for new transactions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
        {/* Tax Rate */}
        <div className="p-6 bg-surface-container-low rounded-xl border border-surface-container-highest">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
              <Percent className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-on-surface text-sm">Default Tax Rate</h4>
          </div>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={settings.default_tax_rate ?? 0}
              onChange={(e) => onChange({ default_tax_rate: Number(e.target.value) })}
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg pr-12 py-3 pl-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">%</span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-3 italic">
            Applied automatically on invoice totals unless overridden per client.
          </p>
        </div>

        {/* Payment Terms */}
        <div className="p-6 bg-surface-container-low rounded-xl border border-surface-container-highest">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-on-surface text-sm">Payment Terms</h4>
          </div>
          <select className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer">
            <option>Due on receipt</option>
            <option>Net 30 days</option>
            <option>Net 45 days</option>
            <option>Net 60 days</option>
            <option>Custom terms</option>
          </select>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="reminder"
              defaultChecked
              className="rounded text-primary focus:ring-primary w-4 h-4 border-outline-variant/50 flex-shrink-0 cursor-pointer accent-primary"
            />
            <label htmlFor="reminder" className="text-xs text-on-surface-variant font-medium cursor-pointer">
              Auto-send late reminders
            </label>
          </div>
        </div>

        {/* Currency */}
        <div className="col-span-1 md:col-span-2 p-6 border border-primary/20 bg-primary/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm flex-shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest">Base Currency</p>
              <p className="text-xl font-black text-on-surface">{settings.base_currency || 'USD'} — US Dollar ($)</p>
            </div>
          </div>
          <button
            type="button"
            className="px-6 py-2.5 bg-surface-container-lowest border border-surface-container-highest text-on-surface text-sm font-bold rounded-lg hover:bg-surface-container-high transition-colors whitespace-nowrap"
          >
            Change Currency
          </button>
        </div>
      </div>
    </section>
  );
}
