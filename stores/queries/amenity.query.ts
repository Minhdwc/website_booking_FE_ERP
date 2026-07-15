'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import {
  amenityService,
  AmenitiesResponse,
  AmenityDetailResponse,
} from '@/stores/service/amenity.service';

export type AmenityListParams = {
  search?: string;
  page?: string;
  limit?: string;
};

export const amenityKeys = {
  all: ['amenities'] as const,
  lists: () => [...amenityKeys.all, 'list'] as const,
  list: (params: AmenityListParams = {}) => [...amenityKeys.lists(), params] as const,
  details: () => [...amenityKeys.all, 'detail'] as const,
  detail: (id: string) => [...amenityKeys.details(), id] as const,
};

const fetchAmenities = async (params?: AmenityListParams) => {
  const response = (await amenityService.getAmenities({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.page ? { page: params.page } : {}),
  })) as AmenitiesResponse;
  return unwrapList(response.data);
};

const fetchAmenity = async (id: string) => {
  const response = (await amenityService.getAmenity(id)) as AmenityDetailResponse;
  return response.data;
};

export const useAmenities = (params?: AmenityListParams) =>
  useQuery({
    queryKey: amenityKeys.list(params),
    queryFn: () => fetchAmenities(params),
  });

export const useAmenity = (id: string) =>
  useQuery({
    queryKey: amenityKeys.detail(id),
    queryFn: () => fetchAmenity(id),
    enabled: Boolean(id),
  });

export const useCreateAmenity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof amenityService.createAmenity>[0]) =>
      amenityService.createAmenity(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenityKeys.lists() });
    },
  });
};

export const useUpdateAmenity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof amenityService.updateAmenity>[1];
    }) => amenityService.updateAmenity(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: amenityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: amenityKeys.detail(variables.id) });
    },
  });
};

export const useDeleteAmenity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => amenityService.deleteAmenity(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: amenityKeys.lists() });
      queryClient.removeQueries({ queryKey: amenityKeys.detail(id) });
    },
  });
};
