'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { ClientsStats } from '@/components/clients/clients-stats';
import { ClientsTable } from '@/components/clients/clients-table';
import { ClientModal } from '@/components/clients/client-modal';

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-2">Clients</h2>
          <p className="text-on-surface-variant font-medium">Manage your professional relationships and revenue streams.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-xl shadow-primary/15"
        >
          <UserPlus className="w-5 h-5 fill-white/20" />
          <span className="font-bold text-sm">Add New Client</span>
        </button>
      </div>

      <ClientsStats refreshKey={refreshKey} />
      <ClientsTable refreshKey={refreshKey} onRefresh={handleSuccess} />

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
