import { useState } from 'react';

import { TicketDetailsPanel } from '../../components/TicketDetailsPanel';
import { TicketsTable } from '../../components/TicketsTable';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastProvider';
import { api } from '../../services/api';
import type { Ticket } from '../../types';

export const TicketsPage = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tableKey, setTableKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const { showToast } = useToast();

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await api.syncGmailTickets();
      setTableKey((value) => value + 1);
      showToast(
        `Inbox synced: ${response.data.created_tickets} new tickets, ${response.data.skipped} skipped.`,
        { variant: 'success' },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      showToast(message, { variant: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Tickets</h3>
          <p className="mt-1 text-sm text-slate-500">
            Filter, inspect, and approve AI suggestions in a transaction-style table.
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          {syncing ? 'Syncing...' : 'Sync Inbox'}
        </Button>
      </div>
      <TicketsTable key={tableKey} onSelectTicket={setSelectedTicket} />
      <TicketDetailsPanel
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onRefresh={() => setTableKey((value) => value + 1)}
      />
    </>
  );
};
