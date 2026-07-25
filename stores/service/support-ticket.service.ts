import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { ISupportTicket, SupportTicketStatus } from '@/stores/api/types';

export type SupportTicketsResponse = {
  statusCode: number;
  message: string;
  data: Response<ISupportTicket>;
};

export type SupportTicketResponse = {
  statusCode: number;
  message: string;
  data: ISupportTicket;
};

export const supportTicketService = {
  getTickets: (params?: { page?: string; limit?: string }) =>
    apiRequest('/support-tickets', { method: 'GET', params }),

  getTicket: (id: string) =>
    apiRequest(`/support-tickets/${id}`, { method: 'GET' }),

  create: (body: { type: string; description: string; bookingId?: string }) =>
    apiRequest('/support-tickets', { method: 'POST', body }),

  update: (id: string, body: { status?: SupportTicketStatus; adminNote?: string }) =>
    apiRequest(`/support-tickets/${id}`, {
      method: 'PATCH',
      body,
    }),
};
