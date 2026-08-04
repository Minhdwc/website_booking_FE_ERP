export type SportListParams = {
  search?: string;
  page?: string;
  limit?: string;
};

export const sportKeys = {
  all: ['sports'] as const,
  lists: () => [...sportKeys.all, 'list'] as const,
  list: (params: SportListParams = {}) => [...sportKeys.lists(), params] as const,
  details: () => [...sportKeys.all, 'detail'] as const,
  detail: (id: string) => [...sportKeys.details(), id] as const,
};
