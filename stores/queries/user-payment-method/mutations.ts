'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userPaymentMethodService } from '@/stores/service/user-payment-method.service';

import { userPaymentMethodKeys } from './keys';

export const useCreateUserPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof userPaymentMethodService.createUserPaymentMethod>[0]) =>
      userPaymentMethodService.createUserPaymentMethod(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPaymentMethodKeys.lists() });
    },
  });
};

export const useUpdateUserPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof userPaymentMethodService.updateUserPaymentMethod>[1];
    }) => userPaymentMethodService.updateUserPaymentMethod(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: userPaymentMethodKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userPaymentMethodKeys.detail(variables.id) });
    },
  });
};

export const useDeleteUserPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userPaymentMethodService.deleteUserPaymentMethod(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: userPaymentMethodKeys.lists() });
      queryClient.removeQueries({ queryKey: userPaymentMethodKeys.detail(id) });
    },
  });
};
