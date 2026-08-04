'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import {
  paymentMethodService,
  PaymentMethodsResponse,
  PaymentMethodDetailResponse,
} from '@/stores/service/payment-method.service';

import { paymentMethodKeys, type PaymentMethodListParams } from './keys';

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
