'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import {
  venuePaymentAccountService,
  VenuePaymentAccountsResponse,
  VenuePaymentAccountDetailResponse,
} from '@/stores/service/venue-payment-account.service';

import { venuePaymentAccountKeys, type VenuePaymentAccountListParams } from './keys';

const fetchVenuePaymentAccounts = async (params?: VenuePaymentAccountListParams) => {
  const response = (await venuePaymentAccountService.getVenuePaymentAccounts({
    limit: params?.limit ?? '100',
    ...(params?.venueId ? { venueId: params.venueId } : {}),
    ...(params?.page ? { page: params.page } : {}),
  })) as VenuePaymentAccountsResponse;
  return unwrapList(response.data);
};

const fetchVenuePaymentAccount = async (id: string) => {
  const response = (await venuePaymentAccountService.getVenuePaymentAccount(
    id,
  )) as VenuePaymentAccountDetailResponse;
  return response.data;
};

export const useVenuePaymentAccounts = (params?: VenuePaymentAccountListParams) =>
  useQuery({
    queryKey: venuePaymentAccountKeys.list(params),
    queryFn: () => fetchVenuePaymentAccounts(params),
  });

export const useVenuePaymentAccount = (id: string) =>
  useQuery({
    queryKey: venuePaymentAccountKeys.detail(id),
    queryFn: () => fetchVenuePaymentAccount(id),
    enabled: Boolean(id),
  });
