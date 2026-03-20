'use client';

import { Building2, CreditCard, Palette, Mail } from 'lucide-react';
import clsx from 'clsx';

export function SettingsNav() {
  const navItems = [
    { name: "Company Profile", icon: Building2, active: true },
    { name: "Financial Defaults", icon: CreditCard, active: false },
    { name: "Branding", icon: Palette, active: false },
    { name: "Email Templates", icon: Mail, active: false },
  ];

  return (
    <nav className="space-y-1 sticky top-32">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.name}
            href="#"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all border border-transparent font-medium",
              item.active
                ? "bg-primary/5 text-primary border-primary/10 shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            )}
            onClick={(e) => e.preventDefault()}
          >
            <Icon className={clsx("w-5 h-5", item.active ? "text-primary" : "text-on-surface-variant/70")} />
            <span className="text-sm tracking-tight">{item.name}</span>
            {item.active && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </a>
        );
      })}
    </nav>
  );
}

