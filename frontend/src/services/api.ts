import type {
  AISuggestion,
  ApiResponse,
  DashboardData,
  KnowledgeDocument,
  Settings,
  Ticket,
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const TOKEN_STORAGE_KEY = 'ticketai_token';

interface TicketListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  category?: string;
  date?: string;
  search?: string;
}

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_STORAGE_KEY, token);

async function request<T>(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const errorBody = (await response.json()) as { data?: { error?: string } };
    throw new Error(errorBody.data?.error || 'Request failed');
  }
  return (await response.json()) as ApiResponse<T>;
}

export const api = {
  login: async (username: string, password: string) => {
    const response = await request<{ token: string; username: string }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(response.data.token);
    return response;
  },

  seedData: () =>
    request<{ message: string }>('/seed/', {
      method: 'POST',
    }),

  getDashboard: () => request<DashboardData>('/dashboard/'),

  getTickets: (params: TicketListParams) =>
    request<Ticket[]>(
      `/tickets/${buildQueryString({
        page: params.page,
        page_size: params.pageSize,
        status: params.status,
        category: params.category,
        date: params.date,
        search: params.search,
      })}`,
    ),

  getTicket: (ticketId: number) => request<Ticket>(`/tickets/${ticketId}/`),

  approveTicket: (ticketId: number) =>
    request<{ ticket_id: number; status: string }>(`/tickets/${ticketId}/approve/`, {
      method: 'POST',
    }),

  getAISuggestions: (page = 1, pageSize = 9) =>
    request<AISuggestion[]>(`/ai-suggestions/${buildQueryString({ page, page_size: pageSize })}`),

  updateAISuggestion: (id: number, suggestedReply: string) =>
    request<AISuggestion>(`/ai-suggestions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ suggested_reply: suggestedReply }),
    }),

  approveAISuggestion: (id: number) =>
    request<{ id: number; action: string }>(`/ai-suggestions/${id}/approve/`, {
      method: 'POST',
    }),

  rejectAISuggestion: (id: number) =>
    request<{ id: number; action: string }>(`/ai-suggestions/${id}/reject/`, {
      method: 'POST',
    }),

  getKnowledgeDocuments: (page = 1, pageSize = 10) =>
    request<KnowledgeDocument[]>(
      `/knowledge-documents/${buildQueryString({ page, page_size: pageSize })}`,
    ),

  uploadKnowledgeDocument: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/knowledge-documents/`, {
      method: 'POST',
      headers: token ? { Authorization: `Token ${token}` } : undefined,
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    return (await response.json()) as ApiResponse<KnowledgeDocument>;
  },

  getSettings: () => request<Settings>('/settings/'),

  updateSettings: (payload: Omit<Settings, 'updated'>) =>
    request<Settings>('/settings/', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};
