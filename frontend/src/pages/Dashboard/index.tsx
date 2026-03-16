import { useEffect, useState } from 'react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Table, TableContainer, TableShell, Td, Th, Thead, Tr } from '../../components/ui/Table';
import { api } from '../../services/api';
import type { DashboardData } from '../../types';

const emptyData: DashboardData = {
  stats: {
    total_tickets_today: 0,
    auto_reply_suggestions_generated: 0,
    avg_response_time_minutes: 0,
    tickets_resolved: 0,
  },
  tickets_by_day: [],
  ticket_types: [],
  recent_tickets: [],
};

export const DashboardPage = () => {
  const [dashboard, setDashboard] = useState<DashboardData>(emptyData);

  useEffect(() => {
    const fetchDashboard = async () => {
      const response = await api.getDashboard();
      setDashboard(response.data);
    };
    void fetchDashboard();
  }, []);

  const stats = [
    { label: 'Total Tickets Today', value: dashboard.stats.total_tickets_today },
    {
      label: 'Auto Reply Suggestions Generated',
      value: dashboard.stats.auto_reply_suggestions_generated,
    },
    { label: 'Avg Response Time', value: `${dashboard.stats.avg_response_time_minutes}m` },
    { label: 'Tickets Resolved', value: dashboard.stats.tickets_resolved },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-900">Tickets by day</h3>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.tickets_by_day}>
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="tickets" stroke="#0f172a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-900">Ticket types</h3>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.ticket_types}>
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-900">Recent tickets</h3>
        </CardHeader>
        <CardContent className="p-0">
          <TableShell>
            <TableContainer>
              <Table>
                <Thead>
                  <Tr className="hover:bg-slate-50">
                    <Th>Customer</Th>
                    <Th>Subject</Th>
                    <Th>Status</Th>
                    <Th>AI Suggestion</Th>
                    <Th>Created</Th>
                  </Tr>
                </Thead>
                <tbody>
                  {dashboard.recent_tickets.map((ticket) => (
                    <Tr key={ticket.id}>
                      <Td>{ticket.customer.name}</Td>
                      <Td>{ticket.subject}</Td>
                      <Td className="capitalize">{ticket.status.replace('_', ' ')}</Td>
                      <Td className="max-w-[420px] truncate text-slate-500">
                        {ticket.latest_ai_suggestion?.suggested_reply ?? '—'}
                      </Td>
                      <Td>{new Date(ticket.created).toLocaleDateString()}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          </TableShell>
        </CardContent>
      </Card>
    </div>
  );
};
