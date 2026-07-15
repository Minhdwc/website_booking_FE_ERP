'use client';

import { useQuery } from '@tanstack/react-query';

import { reportService, ReportSummary } from '@/stores/service/report.service';

export type ReportSummaryParams = {
  from?: string;
  to?: string;
};

export const reportKeys = {
  all: ['reports'] as const,
  summaries: () => [...reportKeys.all, 'summary'] as const,
  summary: (params: ReportSummaryParams = {}) => [...reportKeys.summaries(), params] as const,
};

const fetchReportSummary = async (params?: ReportSummaryParams): Promise<ReportSummary> => {
  const response = await reportService.getSummary(params);
  return response.data;
};

export const useReportSummary = (params?: ReportSummaryParams) =>
  useQuery({
    queryKey: reportKeys.summary(params),
    queryFn: () => fetchReportSummary(params),
    staleTime: 5 * 60 * 1000,
  });
