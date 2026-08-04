'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import { ISupportTicket } from '@/stores/api/types';
import {
  supportTicketService,
  SupportTicketsResponse,
} from '@/stores/service/support-ticket.service';

import { supportTicketKeys, type SupportTicketListParams } from './keys';

const fetchSupportTickets = async (params?: SupportTicketListParams): Promise<ISupportTicket[]> => {
  const response = (await supportTicketService.getTickets({
    limit: params?.limit ?? '50',
    ...(params?.page ? { page: params.page } : {}),
  })) as SupportTicketsResponse;
  return unwrapList(response.data);
};

export const useSupportTickets = (
  params?: SupportTicketListParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: supportTicketKeys.list(params),
    queryFn: () => fetchSupportTickets(params),
    enabled: options?.enabled,
  });
