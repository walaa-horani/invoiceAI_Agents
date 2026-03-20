export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  address?: string;
  initials?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id?: string;
  invoice_number: string;
  status: 'paid' | 'pending' | 'overdue';
  issue_date: string;
  due_date?: string;
  notes?: string;
  total_amount: number;
  created_at: string;
  clients?: Client;
  line_items?: LineItem[];
}

export interface LineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface UserSettings {
  user_id: string;
  company_name?: string;
  tax_id?: string;
  billing_address?: string;
  logo_url?: string;
  logo_key?: string;
  default_tax_rate: number;
  base_currency: string;
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
