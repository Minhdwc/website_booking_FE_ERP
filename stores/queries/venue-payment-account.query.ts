'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import {
  venuePaymentAccountService,
  VenuePaymentAccountsResponse,
  VenuePaymentAccountDetailResponse,
} from '@/stores/service/venue-payment-account.service';

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

export const useCreateVenuePaymentAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      body: Parameters<typeof venuePaymentAccountService.createVenuePaymentAccount>[0],
    ) => venuePaymentAccountService.createVenuePaymentAccount(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venuePaymentAccountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};

export const useUpdateVenuePaymentAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof venuePaymentAccountService.updateVenuePaymentAccount>[1];
    }) => venuePaymentAccountService.updateVenuePaymentAccount(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venuePaymentAccountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: venuePaymentAccountKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};

export const useUploadVenuePaymentAccountQrCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      venuePaymentAccountService.uploadQrCode(id, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venuePaymentAccountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: venuePaymentAccountKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};

export const useDeleteVenuePaymentAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => venuePaymentAccountService.deleteVenuePaymentAccount(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: venuePaymentAccountKeys.lists() });
      queryClient.removeQueries({ queryKey: venuePaymentAccountKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};
