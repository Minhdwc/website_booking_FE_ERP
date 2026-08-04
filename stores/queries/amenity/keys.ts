export type AmenityListParams = {
  search?: string;
  page?: string;
  limit?: string;
};

export const amenityKeys = {
  all: ['amenities'] as const,
  lists: () => [...amenityKeys.all, 'list'] as const,
  list: (params: AmenityListParams = {}) => [...amenityKeys.lists(), params] as const,
  details: () => [...amenityKeys.all, 'detail'] as const,
  detail: (id: string) => [...amenityKeys.details(), id] as const,
};
