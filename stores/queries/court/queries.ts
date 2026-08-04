'use client';

import { QueryClient, useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import { ICourtAvailability } from '@/stores/api/types';
import {
  courtService,
  type CourtAvailabilityResponse,
  type CourtDetailResponse,
  type CourtsResponse,
} from '@/stores/service/court.service';

import { courtKeys, type CourtListParams } from './keys';

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

const fetchCourtAvailability = async (id: string, date: string): Promise<ICourtAvailability> => {
  const response = (await courtService.getAvailability(id, date)) as CourtAvailabilityResponse;
  return response.data;
};

export const useCourtAvailability = (courtId: string | undefined, date: string) =>
  useQuery({
    queryKey: courtKeys.availability(courtId ?? '', date),
    queryFn: () => fetchCourtAvailability(courtId!, date),
    enabled: Boolean(courtId && date),
    staleTime: 30_000,
  });

export const prefetchCourt = (queryClient: QueryClient, id: string) =>
  queryClient.prefetchQuery({
    queryKey: courtKeys.detail(id),
    queryFn: () => fetchCourt(id),
  });
