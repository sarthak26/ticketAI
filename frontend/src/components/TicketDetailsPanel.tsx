import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { api } from '../services/api';
import type { Ticket } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useToast } from './ui/ToastProvider';

interface TicketDetailsPanelProps {
  ticket: Ticket | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const TicketDetailsPanel = ({ ticket, onClose, onRefresh }: TicketDetailsPanelProps) => {
  const [editedReply, setEditedReply] = useState(ticket?.latest_ai_suggestion?.suggested_reply ?? '');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setEditedReply(ticket?.latest_ai_suggestion?.suggested_reply ?? '');
  }, [ticket]);

  if (!ticket) {
    return null;
  }

  const suggestion = ticket.latest_ai_suggestion;

  const onSaveEdit = async () => {
    if (!suggestion) {
      return;
    }
    setSaving(true);
    try {
      await api.updateAISuggestion(suggestion.id, editedReply);
      onRefresh();
      showToast('Reply updated', { variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update reply';
      showToast(message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onApprove = async () => {
    setSaving(true);
    try {
      const response = await api.approveAndSendGmailReply(ticket.id, editedReply);
      onRefresh();
      onClose();
      const action = (response.data as { action?: string }).action ?? 'approved_and_sent';
      const label =
        action === 'approved_without_gmail_send'
          ? 'Reply approved (no Gmail thread)'
          : 'Reply approved and sent';
      showToast(label, { variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve and send reply';
      showToast(message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-xl border-l border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-sm text-slate-500">Ticket #{ticket.id}</p>
          <h3 className="text-base font-semibold text-slate-900">{ticket.subject}</h3>
        </div>
        <button className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-6 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Customer</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{ticket.customer.name}</p>
          <p className="text-sm text-slate-500">{ticket.customer.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={ticket.status} variant={ticket.status} />
          <span className="text-sm capitalize text-slate-500">{ticket.category}</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Customer message</p>
          <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{ticket.message}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">AI generated reply</p>
          <textarea
            value={editedReply}
            onChange={(e) => setEditedReply(e.target.value)}
            className="mt-2 h-44 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
        <Button variant="secondary" onClick={onSaveEdit} disabled={saving || !suggestion}>
          Edit reply
        </Button>
        <Button onClick={onApprove} disabled={saving}>
          Approve reply
        </Button>
      </div>
    </div>
  );
};
