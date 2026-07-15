'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import {
  paymentMethodService,
  PaymentMethodsResponse,
  PaymentMethodDetailResponse,
} from '@/stores/service/payment-method.service';

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

const fetchPaymentMethods = async (params?: PaymentMethodListParams) => {
  const response = (await paymentMethodService.getPaymentMethods({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.page ? { page: params.page } : {}),
  })) as PaymentMethodsResponse;
  return unwrapList(response.data);
};

const fetchPaymentMethod = async (id: string) => {
  const response = (await paymentMethodService.getPaymentMethod(id)) as PaymentMethodDetailResponse;
  return response.data;
};

export const usePaymentMethods = (params?: PaymentMethodListParams) =>
  useQuery({
    queryKey: paymentMethodKeys.list(params),
    queryFn: () => fetchPaymentMethods(params),
  });

export const usePaymentMethod = (id: string) =>
  useQuery({
    queryKey: paymentMethodKeys.detail(id),
    queryFn: () => fetchPaymentMethod(id),
    enabled: Boolean(id),
  });

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
