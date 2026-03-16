import { useEffect, useState } from 'react';

import { api } from '../services/api';
import type { ApiPagination, Ticket } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Table, TableContainer, TableShell, Td, Th, Thead, Tr } from './ui/Table';

interface TicketsTableProps {
  onSelectTicket: (ticket: Ticket) => void;
}

export const TicketsTable = ({ onSelectTicket }: TicketsTableProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState<ApiPagination>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const response = await api.getTickets({
          page,
          pageSize: 10,
          search,
          status,
          category,
          date,
        });
        setTickets(response.data);
        setPagination(response.pagination);
      } finally {
        setLoading(false);
      }
    };
    void fetchTickets();
  }, [page, search, status, category, date]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-purple-100 bg-white/90 p-4 shadow-soft md:grid-cols-4">
        <Input
          placeholder="Search customer or subject..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </Select>
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          <option value="billing">Billing</option>
          <option value="technical">Technical</option>
          <option value="account">Account</option>
          <option value="general">General</option>
        </Select>
        <Input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <TableShell>
        <TableContainer>
          <Table>
            <Thead>
              <Tr className="hover:bg-slate-50">
                <Th>Customer</Th>
                <Th>Subject</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>AI Reply Suggestion</Th>
                <Th>Created At</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {loading ? (
                <Tr>
                  <Td className="py-6 text-center text-slate-500" colSpan={7}>
                    Loading tickets...
                  </Td>
                </Tr>
              ) : tickets.length === 0 ? (
                <Tr>
                  <Td className="py-6 text-center text-slate-500" colSpan={7}>
                    No tickets found for this filter.
                  </Td>
                </Tr>
              ) : (
                tickets.map((ticket) => (
                  <Tr key={ticket.id}>
                    <Td>
                      <div className="font-medium text-slate-800">{ticket.customer.name}</div>
                    </Td>
                    <Td>{ticket.subject}</Td>
                    <Td className="capitalize">{ticket.category}</Td>
                    <Td>
                      <Badge label={ticket.status} variant={ticket.status} />
                    </Td>
                    <Td className="max-w-[300px] truncate text-slate-500">
                      {ticket.latest_ai_suggestion?.suggested_reply || '—'}
                    </Td>
                    <Td>{new Date(ticket.created).toLocaleDateString()}</Td>
                    <Td className="text-right">
                      <Button variant="secondary" onClick={() => onSelectTicket(ticket)}>
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        </TableContainer>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-sm text-slate-500">
            Page {pagination.page ?? 1} of {pagination.total_pages ?? 1}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={(pagination.page ?? 1) <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={(pagination.page ?? 1) >= (pagination.total_pages ?? 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </TableShell>
    </div>
  );
};
