'use client';

import { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import { courtService, CourtsResponse, CourtDetailResponse } from '@/stores/service/court.service';

export type CourtListParams = {
  search?: string;
  venueId?: string;
  page?: string;
  limit?: string;
};

export const courtKeys = {
  all: ['courts'] as const,
  lists: () => [...courtKeys.all, 'list'] as const,
  list: (params?: CourtListParams) => [...courtKeys.lists(), params ?? {}] as const,
  details: () => [...courtKeys.all, 'detail'] as const,
  detail: (id: string) => [...courtKeys.details(), id] as const,
};

const fetchCourts = async (params?: CourtListParams) => {
  const response = (await courtService.getCourts({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.venueId ? { venueId: params.venueId } : {}),
    ...(params?.page ? { page: params.page } : {}),
  })) as CourtsResponse;
  return unwrapList(response.data);
};

const fetchCourt = async (id: string) => {
  const response = (await courtService.getCourt(id)) as CourtDetailResponse;
  return response.data;
};

export const useCourts = (params?: CourtListParams) =>
  useQuery({
    queryKey: courtKeys.list(params),
    queryFn: () => fetchCourts(params),
  });

export const useCourt = (id: string) =>
  useQuery({
    queryKey: courtKeys.detail(id),
    queryFn: () => fetchCourt(id),
    enabled: Boolean(id),
  });

export const useCreateCourt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof courtService.createCourt>[0]) =>
      courtService.createCourt(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
    },
  });
};

export const useUpdateCourt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof courtService.updateCourt>[1];
    }) => courtService.updateCourt(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courtKeys.detail(variables.id) });
    },
  });
};

export const useDeleteCourt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courtService.deleteCourt(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
      queryClient.removeQueries({ queryKey: courtKeys.detail(id) });
    },
  });
};

export const useUploadCourtImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courtId, file }: { courtId: string; file: File }) =>
      courtService.uploadCourtImage(courtId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courtKeys.detail(variables.courtId) });
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
    },
  });
};

export const useDeleteCourtImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courtId, imageId }: { courtId: string; imageId: string }) =>
      courtService.deleteCourtImage(courtId, imageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courtKeys.detail(variables.courtId) });
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
    },
  });
};

export const prefetchCourt = (queryClient: QueryClient, id: string) =>
  queryClient.prefetchQuery({
    queryKey: courtKeys.detail(id),
    queryFn: () => fetchCourt(id),
  });
