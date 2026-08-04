'use client';

import { useQuery } from '@tanstack/react-query';

import { analyticsService, AnalyticsOverview } from '@/stores/service/analytics.service';

import { analyticsKeys, type AnalyticsOverviewParams } from './keys';

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
