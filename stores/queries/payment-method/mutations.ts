'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { paymentMethodService } from '@/stores/service/payment-method.service';

import { paymentMethodKeys } from './keys';

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof paymentMethodService.createPaymentMethod>[0]) =>
      paymentMethodService.createPaymentMethod(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.lists() });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof paymentMethodService.updatePaymentMethod>[1];
    }) => paymentMethodService.updatePaymentMethod(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.detail(variables.id) });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentMethodService.deletePaymentMethod(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.lists() });
      queryClient.removeQueries({ queryKey: paymentMethodKeys.detail(id) });
    },
  });
};
