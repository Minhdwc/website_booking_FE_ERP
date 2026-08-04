export type PaymentMethodListParams = {
  search?: string;
  page?: string;
  limit?: string;
};

export const paymentMethodKeys = {
  all: ['payment-methods'] as const,
  lists: () => [...paymentMethodKeys.all, 'list'] as const,
  list: (params: PaymentMethodListParams = {}) => [...paymentMethodKeys.lists(), params] as const,
  details: () => [...paymentMethodKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentMethodKeys.details(), id] as const,
};
