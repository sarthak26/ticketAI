import { useEffect, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { api } from '../../services/api';
import type { AISuggestion } from '../../types';

export const AISuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  const fetchSuggestions = async () => {
    const response = await api.getAISuggestions();
    setSuggestions(response.data);
  };

  useEffect(() => {
    void fetchSuggestions();
  }, []);

  const onEdit = async (id: number, currentReply: string) => {
    const nextReply = window.prompt('Edit AI suggested reply', currentReply);
    if (!nextReply || nextReply === currentReply) {
      return;
    }
    await api.updateAISuggestion(id, nextReply);
    await fetchSuggestions();
  };

  const onApprove = async (id: number) => {
    await api.approveAISuggestion(id);
    await fetchSuggestions();
  };

  const onReject = async (id: number) => {
    await api.rejectAISuggestion(id);
    await fetchSuggestions();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">AI Suggestions</h3>
        <p className="mt-1 text-sm text-slate-500">Review generated replies and approve before sending.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="border-indigo-100">
            <CardHeader>
              <h4 className="text-sm font-semibold text-slate-900">{suggestion.ticket_subject}</h4>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Customer question</p>
                <p className="mt-1 text-sm text-slate-700">{suggestion.customer_question}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">AI suggested reply</p>
                <p className="mt-1 rounded-md bg-indigo-50/70 p-3 text-sm text-slate-700">
                  {suggestion.suggested_reply}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => onApprove(suggestion.id)}>Approve</Button>
                <Button variant="secondary" onClick={() => onEdit(suggestion.id, suggestion.suggested_reply)}>
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => onReject(suggestion.id)}>
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
