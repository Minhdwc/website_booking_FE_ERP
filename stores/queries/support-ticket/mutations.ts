'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supportTicketService } from '@/stores/service/support-ticket.service';

import { supportTicketKeys } from './keys';

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
