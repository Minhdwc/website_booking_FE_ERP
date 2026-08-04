export type ReviewListParams = {
  search?: string;
  page?: string;
  limit?: string;
};

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (params: ReviewListParams = {}) => [...reviewKeys.lists(), params] as const,
};
