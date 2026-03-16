import { useState } from 'react';

import { TicketDetailsPanel } from '../../components/TicketDetailsPanel';
import { TicketsTable } from '../../components/TicketsTable';
import type { Ticket } from '../../types';

export const TicketsPage = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tableKey, setTableKey] = useState(0);

  return (
    <>
      <div className="mb-4">
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Tickets</h3>
        <p className="mt-1 text-sm text-slate-500">
          Filter, inspect, and approve AI suggestions in a transaction-style table.
        </p>
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
