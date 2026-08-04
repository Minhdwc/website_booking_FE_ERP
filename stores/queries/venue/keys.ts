export type VenueListParams = {
  search?: string;
  page?: string;
  limit?: string;
};

export const venueKeys = {
  all: ['venues'] as const,
  lists: () => [...venueKeys.all, 'list'] as const,
  list: (params: VenueListParams = {}) => [...venueKeys.lists(), params] as const,
  details: () => [...venueKeys.all, 'detail'] as const,
  detail: (id: string) => [...venueKeys.details(), id] as const,
};
