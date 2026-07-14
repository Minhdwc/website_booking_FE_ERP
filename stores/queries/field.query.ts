'use client';

import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fieldService, FieldsResponse, FieldDetailResponse } from '@/stores/service/field.service';

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
  const response = (await fieldService.getFields({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.venueId ? { venueId: params.venueId } : {}),
    ...(params?.page ? { page: params.page } : {}),
  })) as FieldsResponse;
  return response.data;
};

const fetchField = async (id: string) => {
  const response = (await fieldService.getField(id)) as FieldDetailResponse;
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
    mutationFn: (body: Parameters<typeof fieldService.createField>[0]) =>
      fieldService.createField(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
    },
  });
};

export const useUpdateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof fieldService.updateField>[1] }) =>
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

export const useUploadFieldImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId, file }: { fieldId: string; file: File }) =>
      fieldService.uploadFieldImage(fieldId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.detail(variables.fieldId) });
      queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
    },
  });
};

export const useDeleteFieldImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId, imageId }: { fieldId: string; imageId: string }) =>
      fieldService.deleteFieldImage(fieldId, imageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.detail(variables.fieldId) });
      queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
    },
  });
};

export const prefetchField = (queryClient: QueryClient, id: string) =>
  queryClient.prefetchQuery({
    queryKey: fieldKeys.detail(id),
    queryFn: () => fetchField(id),
  });
