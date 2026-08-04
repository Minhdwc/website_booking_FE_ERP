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
