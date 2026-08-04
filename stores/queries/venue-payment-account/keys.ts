export type VenuePaymentAccountListParams = {
  venueId?: string;
  page?: string;
  limit?: string;
};

export const venuePaymentAccountKeys = {
  all: ['venue-payment-accounts'] as const,
  lists: () => [...venuePaymentAccountKeys.all, 'list'] as const,
  list: (params: VenuePaymentAccountListParams = {}) =>
    [...venuePaymentAccountKeys.lists(), params] as const,
  details: () => [...venuePaymentAccountKeys.all, 'detail'] as const,
  detail: (id: string) => [...venuePaymentAccountKeys.details(), id] as const,
};
