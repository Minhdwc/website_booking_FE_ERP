export type CourtListParams = {
  search?: string;
  venueId?: string;
  page?: string;
  limit?: string;
};

export const courtKeys = {
  all: ['courts'] as const,
  lists: () => [...courtKeys.all, 'list'] as const,
  list: (params?: CourtListParams) => [...courtKeys.lists(), params ?? {}] as const,
  details: () => [...courtKeys.all, 'detail'] as const,
  detail: (id: string) => [...courtKeys.details(), id] as const,
};
