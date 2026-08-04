'use client';

import { useQuery } from '@tanstack/react-query';

import { reportService, ReportSummary } from '@/stores/service/report.service';

import { reportKeys, type ReportSummaryParams } from './keys';

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
