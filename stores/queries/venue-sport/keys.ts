export type VenueSportListParams = {
  venueId?: string;
  page?: string;
  limit?: string;
  isActive?: boolean;
};

export const venueSportKeys = {
  all: ['venue-sports'] as const,
  lists: () => [...venueSportKeys.all, 'list'] as const,
  list: (params: VenueSportListParams = {}) => [...venueSportKeys.lists(), params] as const,
  details: () => [...venueSportKeys.all, 'detail'] as const,
  detail: (id: string) => [...venueSportKeys.details(), id] as const,
};
