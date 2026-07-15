'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import {
  userPaymentMethodService,
  UserPaymentMethodsResponse,
  UserPaymentMethodDetailResponse,
} from '@/stores/service/user-payment-method.service';

export type UserPaymentMethodListParams = {
  page?: string;
  limit?: string;
};

export const userPaymentMethodKeys = {
  all: ['user-payment-methods'] as const,
  lists: () => [...userPaymentMethodKeys.all, 'list'] as const,
  list: (params: UserPaymentMethodListParams = {}) =>
    [...userPaymentMethodKeys.lists(), params] as const,
  details: () => [...userPaymentMethodKeys.all, 'detail'] as const,
  detail: (id: string) => [...userPaymentMethodKeys.details(), id] as const,
};

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
