'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  venueSportService,
  VenueSportsResponse,
  VenueSportDetailResponse,
} from '@/stores/service/venue-sport.service';

export type VenueSportListParams = {
  venueId?: string;
};

export const venueSportKeys = {
  all: ['venue-sports'] as const,
  lists: () => [...venueSportKeys.all, 'list'] as const,
  list: (params: VenueSportListParams = {}) => [...venueSportKeys.lists(), params] as const,
  details: () => [...venueSportKeys.all, 'detail'] as const,
  detail: (id: string) => [...venueSportKeys.details(), id] as const,
};

const fetchVenueSports = async (params?: VenueSportListParams) => {
  const response = (await venueSportService.getVenueSports(params)) as VenueSportsResponse;
  return response.data;
};

const fetchVenueSport = async (id: string) => {
  const response = (await venueSportService.getVenueSport(id)) as VenueSportDetailResponse;
  return response.data;
};

export const useVenueSports = (params?: VenueSportListParams) =>
  useQuery({
    queryKey: venueSportKeys.list(params),
    queryFn: () => fetchVenueSports(params),
  });

export const useVenueSport = (id: string) =>
  useQuery({
    queryKey: venueSportKeys.detail(id),
    queryFn: () => fetchVenueSport(id),
    enabled: Boolean(id),
  });

export const useCreateVenueSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof venueSportService.createVenueSport>[0]) =>
      venueSportService.createVenueSport(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueSportKeys.lists() });
    },
  });
};

export const useUpdateVenueSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof venueSportService.updateVenueSport>[1];
    }) => venueSportService.updateVenueSport(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venueSportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: venueSportKeys.detail(variables.id) });
    },
  });
};

export const useDeleteVenueSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => venueSportService.deleteVenueSport(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: venueSportKeys.lists() });
      queryClient.removeQueries({ queryKey: venueSportKeys.detail(id) });
    },
  });
};
