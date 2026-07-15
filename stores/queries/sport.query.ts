'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import { sportService, SportsResponse, SportDetailResponse } from '@/stores/service/sport.service';

export type SportListParams = {
  search?: string;
  page?: string;
  limit?: string;
};

export const sportKeys = {
  all: ['sports'] as const,
  lists: () => [...sportKeys.all, 'list'] as const,
  list: (params: SportListParams = {}) => [...sportKeys.lists(), params] as const,
  details: () => [...sportKeys.all, 'detail'] as const,
  detail: (id: string) => [...sportKeys.details(), id] as const,
};

const fetchSports = async (params?: SportListParams) => {
  const response = (await sportService.getSports({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.page ? { page: params.page } : {}),
  })) as SportsResponse;
  return unwrapList(response.data);
};

const fetchSport = async (id: string) => {
  const response = (await sportService.getSport(id)) as SportDetailResponse;
  return response.data;
};

export const useSports = (params?: SportListParams) =>
  useQuery({
    queryKey: sportKeys.list(params),
    queryFn: () => fetchSports(params),
  });

export const useSport = (id: string) =>
  useQuery({
    queryKey: sportKeys.detail(id),
    queryFn: () => fetchSport(id),
    enabled: Boolean(id),
  });

export const useCreateSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { name: string }) => sportService.createSport(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
    },
  });
};

export const useUpdateSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name?: string } }) =>
      sportService.updateSport(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sportKeys.detail(variables.id) });
    },
  });
};

export const useDeleteSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sportService.deleteSport(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
      queryClient.removeQueries({ queryKey: sportKeys.detail(id) });
    },
  });
};
