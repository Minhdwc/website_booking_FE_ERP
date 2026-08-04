export type SupportTicketListParams = {
  page?: string;
  limit?: string;
};

export const supportTicketKeys = {
  all: ['support-tickets'] as const,
  lists: () => [...supportTicketKeys.all, 'list'] as const,
  list: (params?: SupportTicketListParams) => [...supportTicketKeys.lists(), params ?? {}] as const,
  detail: (id: string) => [...supportTicketKeys.all, 'detail', id] as const,
};
