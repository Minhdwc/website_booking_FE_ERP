'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import { sportService, SportsResponse, SportDetailResponse } from '@/stores/service/sport.service';

import { sportKeys, type SportListParams } from './keys';

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
