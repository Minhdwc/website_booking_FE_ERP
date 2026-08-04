export type PaymentListParams = {
  search?: string;
  page?: string;
  limit?: string;
};

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params: PaymentListParams = {}) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
};
