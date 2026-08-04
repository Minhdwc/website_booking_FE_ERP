'use client';

import { QueryClient, useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import {
  venueService,
  type VenueDetailResponse,
  type VenuesResponse,
} from '@/stores/service/venue.service';

import { venueKeys, type VenueListParams } from './keys';

const fetchVenues = async (params?: VenueListParams) => {
  const response = (await venueService.getVenues({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.page ? { page: params.page } : {}),
  })) as VenuesResponse;
  return unwrapList(response.data);
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
