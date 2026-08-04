'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import {
  userPaymentMethodService,
  UserPaymentMethodsResponse,
  UserPaymentMethodDetailResponse,
} from '@/stores/service/user-payment-method.service';

import { userPaymentMethodKeys, type UserPaymentMethodListParams } from './keys';

const fetchUserPaymentMethods = async (params?: UserPaymentMethodListParams) => {
  const response = (await userPaymentMethodService.getUserPaymentMethods({
    limit: params?.limit ?? '100',
    ...(params?.page ? { page: params.page } : {}),
  })) as UserPaymentMethodsResponse;
  return unwrapList(response.data);
};

const fetchUserPaymentMethod = async (id: string) => {
  const response = (await userPaymentMethodService.getUserPaymentMethod(
    id,
  )) as UserPaymentMethodDetailResponse;
  return response.data;
};

export const useUserPaymentMethods = (params?: UserPaymentMethodListParams) =>
  useQuery({
    queryKey: userPaymentMethodKeys.list(params),
    queryFn: () => fetchUserPaymentMethods(params),
  });

export const useUserPaymentMethod = (id: string) =>
  useQuery({
    queryKey: userPaymentMethodKeys.detail(id),
    queryFn: () => fetchUserPaymentMethod(id),
    enabled: Boolean(id),
  });
