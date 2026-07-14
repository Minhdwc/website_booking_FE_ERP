import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IVenue } from '@/stores/api/types';
import { venueService, VenuesResponse, VenueDetailResponse } from '@/stores/service/venue.service';

export type VenueListParams = {
  search?: string;
  page?: string;
  limit?: string;
};

export const venueKeys = {
  all: ['venues'] as const,
  lists: () => [...venueKeys.all, 'list'] as const,
  list: (params: VenueListParams = {}) => [...venueKeys.lists(), params] as const,
  details: () => [...venueKeys.all, 'detail'] as const,
  detail: (id: string) => [...venueKeys.details(), id] as const,
};

const fetchVenues = async (params?: VenueListParams) => {
  const response = (await venueService.getVenues({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.page ? { page: params.page } : {}),
  })) as VenuesResponse;
  return response.data;
};

const fetchVenue = async (id: string) => {
  const response = (await venueService.getVenue(id)) as VenueDetailResponse;
  return response.data;
};

export const useVenues = (params?: VenueListParams) =>
  useQuery({
    queryKey: venueKeys.list(params),
    queryFn: () => fetchVenues(params),
  });

export const useVenue = (id: string) =>
  useQuery({
    queryKey: venueKeys.detail(id),
    queryFn: () => fetchVenue(id),
    enabled: Boolean(id),
  });

export const useCreateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof venueService.createVenue>[0]) =>
      venueService.createVenue(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof venueService.updateVenue>[1] }) =>
      venueService.updateVenue(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(variables.id) });
    },
  });
};

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => venueService.deleteVenue(id),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData<IVenue[]>({ queryKey: venueKeys.lists() }, (old?: IVenue[]) =>
        old?.filter((item) => item.id !== id),
      );
      queryClient.removeQueries({ queryKey: venueKeys.detail(id) });
    },
  });
};

export const useUploadVenueImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ venueId, file }: { venueId: string; file: File }) =>
      venueService.uploadVenueImage(venueId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(variables.venueId) });
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};

export const useDeleteVenueImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ venueId, imageId }: { venueId: string; imageId: string }) =>
      venueService.deleteVenueImage(venueId, imageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(variables.venueId) });
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};

export const prefetchVenue = (queryClient: QueryClient, id: string) =>
  queryClient.prefetchQuery({
    queryKey: venueKeys.detail(id),
    queryFn: () => fetchVenue(id),
  });

export const prefetchVenues = (queryClient: QueryClient, params?: VenueListParams) =>
  queryClient.prefetchQuery({
    queryKey: venueKeys.list(params),
    queryFn: () => fetchVenues(params),
  });
