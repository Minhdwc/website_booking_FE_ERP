'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import {
  amenityService,
  AmenitiesResponse,
  AmenityDetailResponse,
} from '@/stores/service/amenity.service';

import { amenityKeys, type AmenityListParams } from './keys';

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
