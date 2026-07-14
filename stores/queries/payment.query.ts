'use client';

import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IPayment, PaymentMethod, PaymentStatus } from '@/stores/api/types';
import { paymentService } from '@/stores/service/payment.service';

export type PaymentListParams = {
  search?: string;
  page?: string;
  limit?: string;
};

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params: PaymentListParams = {}) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
};

const fetchPayments = async (params?: PaymentListParams) => {
  const response = await paymentService.getPayments({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.page ? { page: params.page } : {}),
  });
  return response.data;
};

const fetchPayment = async (id: string) => {
  const response = await paymentService.getPayment(id);
  return response.data;
};

export const usePayments = (params?: PaymentListParams) =>
  useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => fetchPayments(params),
  });

export const usePayment = (id: string) =>
  useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => fetchPayment(id),
    enabled: Boolean(id),
  });

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { bookingId: string; method?: PaymentMethod; status?: PaymentStatus }) =>
      paymentService.createPayment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<IPayment> }) =>
      paymentService.updatePayment(id, body),
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

export const prefetchPayment = (queryClient: QueryClient, id: string) =>
  queryClient.prefetchQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => fetchPayment(id),
  });
