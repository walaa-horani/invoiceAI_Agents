'use client';

import { useEffect, useState } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import { Client } from '@/lib/types';

const PAGE_SIZE = 10;
const THEMES = [
  'bg-primary/10 text-primary',
  'bg-secondary-container/50 text-secondary',
  'bg-tertiary-container/50 text-tertiary',
];

interface Props {
  refreshKey?: number;
  onRefresh?: () => void;
}

export function ClientsTable({ refreshKey = 0, onRefresh }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchClients = () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    insforge.database
      .from('clients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
      .then(({ data, count }) => {
        setClients((data as Client[]) || []);
        setTotal(count || 0);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this client? Their invoices will remain.')) return;
    await insforge.database.from('clients').delete().eq('id', id);
    fetchClients();
    onRefresh?.();
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="bg-surface border border-surface-container-highest rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant">Client Detail</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant">Contact Email</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant">Billing Address</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {[1, 2, 3, 4].map((j) => (
                    <td key={j} className="px-8 py-6">
                      <div className="h-4 bg-surface-container-high rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-on-surface-variant font-medium">
                  No clients yet. Add your first client above.
                </td>
              </tr>
            ) : (
              clients.map((client, idx) => {
                const theme = THEMES[idx % THEMES.length];
                const initials = client.initials || client.name.slice(0, 2).toUpperCase();
                return (
                  <tr key={client.id} className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${theme}`}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{client.name}</p>
                          <p className="text-xs text-on-surface-variant">
                            {client.id.slice(0, 8)}…
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-on-surface-variant font-medium">{client.email}</td>
                    <td className="px-8 py-6 text-sm text-on-surface-variant max-w-xs truncate">
                      {client.address || '—'}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-primary-container rounded-lg transition-colors text-outline hover:text-primary">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 hover:bg-error-container rounded-lg transition-colors text-outline hover:text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-container-highest">
        <p className="text-xs text-on-surface-variant font-medium">
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total} client{total !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 text-xs font-bold bg-surface-container-low text-on-surface-variant border border-surface-container-highest rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-40"
          >
            Previous
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
