'use client';

import { QueryClient, useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import {
  paymentService,
  PaymentsResponse,
  PaymentDetailResponse,
} from '@/stores/service/payment.service';

import { paymentKeys, type PaymentListParams } from './keys';

const fetchPayments = async (params?: PaymentListParams) => {
  const response = (await paymentService.getPayments({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.page ? { page: params.page } : {}),
  })) as PaymentsResponse;
  return unwrapList(response.data);
};

const fetchPayment = async (id: string) => {
  const response = (await paymentService.getPayment(id)) as PaymentDetailResponse;
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

export const prefetchPayment = (queryClient: QueryClient, id: string) =>
  queryClient.prefetchQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => fetchPayment(id),
  });
