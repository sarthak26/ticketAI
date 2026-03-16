export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export type TicketCategory = 'billing' | 'technical' | 'account' | 'general';

export interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
}

export interface AISuggestion {
  id: number;
  ticket: number;
  ticket_subject: string;
  customer_question: string;
  suggested_reply: string;
  confidence: string;
  created: string;
}

export interface Ticket {
  id: number;
  customer: Customer;
  subject: string;
  message: string;
  status: TicketStatus;
  category: TicketCategory;
  created: string;
  updated: string;
  latest_ai_suggestion: AISuggestion | null;
}

export interface KnowledgeDocument {
  id: number;
  name: string;
  content: string;
  source: string;
  created: string;
}

export interface Settings {
  company_name: string;
  support_email: string;
  model_temperature: string;
  auto_suggest_enabled: boolean;
  updated: string;
}

export interface DashboardData {
  stats: {
    total_tickets_today: number;
    auto_reply_suggestions_generated: number;
    avg_response_time_minutes: number;
    tickets_resolved: number;
  };
  tickets_by_day: Array<{ day: string; tickets: number }>;
  ticket_types: Array<{ category: string; count: number }>;
  recent_tickets: Ticket[];
}

export interface ApiPagination {
  page?: number;
  page_size?: number;
  total?: number;
  total_pages?: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination: ApiPagination;
}
