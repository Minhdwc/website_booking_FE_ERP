'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import {
  venueSportService,
  VenueSportsResponse,
  VenueSportDetailResponse,
} from '@/stores/service/venue-sport.service';

import { venueSportKeys, type VenueSportListParams } from './keys';

const fetchVenueSports = async (params?: VenueSportListParams) => {
  const response = (await venueSportService.getVenueSports({
    limit: params?.limit ?? '100',
    ...(params?.venueId ? { venueId: params.venueId } : {}),
    ...(params?.page ? { page: params.page } : {}),
    ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
  })) as VenueSportsResponse;
  return unwrapList(response.data);
};

const fetchVenueSport = async (id: string) => {
  const response = (await venueSportService.getVenueSport(id)) as VenueSportDetailResponse;
  return response.data;
};

export const useVenueSports = (params?: VenueSportListParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: venueSportKeys.list(params ?? {}),
    queryFn: () => fetchVenueSports(params),
    enabled: options?.enabled ?? true,
  });

export const useVenueSport = (id: string) =>
  useQuery({
    queryKey: venueSportKeys.detail(id),
    queryFn: () => fetchVenueSport(id),
    enabled: Boolean(id),
  });
