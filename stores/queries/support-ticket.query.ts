'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import { ISupportTicket } from '@/stores/api/types';
import {
  supportTicketService,
  SupportTicketsResponse,
} from '@/stores/service/support-ticket.service';

export const supportTicketKeys = {
  all: ['support-tickets'] as const,
  lists: () => [...supportTicketKeys.all, 'list'] as const,
  list: (params?: { page?: string; limit?: string }) =>
    [...supportTicketKeys.lists(), params ?? {}] as const,
  detail: (id: string) => [...supportTicketKeys.all, 'detail', id] as const,
};

const fetchSupportTickets = async (params?: {
  page?: string;
  limit?: string;
}): Promise<ISupportTicket[]> => {
  const response = (await supportTicketService.getTickets({
    limit: params?.limit ?? '50',
    ...(params?.page ? { page: params.page } : {}),
  })) as SupportTicketsResponse;
  return unwrapList(response.data);
};

export const useSupportTickets = (
  params?: { page?: string; limit?: string },
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: supportTicketKeys.list(params),
    queryFn: () => fetchSupportTickets(params),
    enabled: options?.enabled,
  });

export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof supportTicketService.update>[1];
    }) => supportTicketService.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportTicketKeys.lists() });
    },
  });
};
