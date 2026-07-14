'use client';

import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IField } from '@/stores/api/types';
import { fieldService } from '@/stores/service/field.service';

export type FieldListParams = {
  search?: string;
  venueId?: string;
  page?: string;
  limit?: string;
};

export const fieldKeys = {
  all: ['fields'] as const,
  lists: () => [...fieldKeys.all, 'list'] as const,
  list: (params?: FieldListParams) => [...fieldKeys.lists(), params ?? {}] as const,
  details: () => [...fieldKeys.all, 'detail'] as const,
  detail: (id: string) => [...fieldKeys.details(), id] as const,
};

const fetchFields = async (params?: FieldListParams) => {
  const response = await fieldService.getFields({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.venueId ? { venueId: params.venueId } : {}),
    ...(params?.page ? { page: params.page } : {}),
  });
  return response.data;
};

const fetchField = async (id: string) => {
  const response = await fieldService.getField(id);
  return response.data;
};

export const useFields = (params?: FieldListParams) =>
  useQuery({
    queryKey: fieldKeys.list(params),
    queryFn: () => fetchFields(params),
  });

export const useField = (id: string) =>
  useQuery({
    queryKey: fieldKeys.detail(id),
    queryFn: () => fetchField(id),
    enabled: Boolean(id),
  });

export const useCreateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Omit<IField, 'id' | 'createdAt' | 'updatedAt' | 'sport' | 'venue'>) =>
      fieldService.createField(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
    },
  });
};

export const useUpdateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<IField> }) =>
      fieldService.updateField(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fieldKeys.detail(variables.id) });
    },
  });
};

export const useDeleteField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fieldService.deleteField(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
      queryClient.removeQueries({ queryKey: fieldKeys.detail(id) });
    },
  });
};

export const prefetchField = (queryClient: QueryClient, id: string) =>
  queryClient.prefetchQuery({
    queryKey: fieldKeys.detail(id),
    queryFn: () => fetchField(id),
  });
