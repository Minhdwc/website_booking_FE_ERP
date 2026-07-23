'use client';

import { useQuery } from '@tanstack/react-query';

import { analyticsService, AnalyticsOverview } from '@/stores/service/analytics.service';

export type AnalyticsOverviewParams = {
  from?: string;
  to?: string;
};

export const analyticsKeys = {
  all: ['analytics'] as const,
  overviews: () => [...analyticsKeys.all, 'overview'] as const,
  overview: (params: AnalyticsOverviewParams = {}) =>
    [...analyticsKeys.overviews(), params] as const,
};

const fetchAnalyticsOverview = async (
  params?: AnalyticsOverviewParams,
): Promise<AnalyticsOverview> => {
  const response = await analyticsService.getOverview(params);
  return response.data;
};

export const useAnalyticsOverview = (params?: AnalyticsOverviewParams) =>
  useQuery({
    queryKey: analyticsKeys.overview(params),
    queryFn: () => fetchAnalyticsOverview(params),
    staleTime: 5 * 60 * 1000,
  });
