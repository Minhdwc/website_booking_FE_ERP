import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IVenue } from '@/stores/api/types';
import { venueService } from '@/stores/service/venue.service';

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
  const response = await venueService.getVenues({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.page ? { page: params.page } : {}),
  });
  return response.data;
};

const fetchVenue = async (id: string) => {
  const response = await venueService.getVenue(id);
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
    mutationFn: (body: Omit<IVenue, 'id' | 'createdAt' | 'updatedAt' | 'fields'>) =>
      venueService.createVenue(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<IVenue> }) =>
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
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
      queryClient.removeQueries({ queryKey: venueKeys.detail(id) });
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
