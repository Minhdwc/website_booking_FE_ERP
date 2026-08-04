export type UserPaymentMethodListParams = {
  page?: string;
  limit?: string;
};

export const userPaymentMethodKeys = {
  all: ['user-payment-methods'] as const,
  lists: () => [...userPaymentMethodKeys.all, 'list'] as const,
  list: (params: UserPaymentMethodListParams = {}) =>
    [...userPaymentMethodKeys.lists(), params] as const,
  details: () => [...userPaymentMethodKeys.all, 'detail'] as const,
  detail: (id: string) => [...userPaymentMethodKeys.details(), id] as const,
};
