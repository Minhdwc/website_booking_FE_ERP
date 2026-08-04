'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { paymentService } from '@/stores/service/payment.service';

import { paymentKeys } from './keys';

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof paymentService.createPayment>[0]) =>
      paymentService.createPayment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof paymentService.updatePayment>[1];
    }) => paymentService.updatePayment(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) });
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentService.deletePayment(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.removeQueries({ queryKey: paymentKeys.detail(id) });
    },
  });
};

export const useCreateVnpayUrl = () =>
  useMutation({
    mutationFn: (paymentId: string) => paymentService.createVnpayUrl(paymentId),
  });
