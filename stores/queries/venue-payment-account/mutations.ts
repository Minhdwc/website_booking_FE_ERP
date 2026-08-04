'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { venuePaymentAccountService } from '@/stores/service/venue-payment-account.service';

import { venuePaymentAccountKeys } from './keys';

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
