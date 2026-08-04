export type ReportSummaryParams = {
  from?: string;
  to?: string;
};

export const reportKeys = {
  all: ['reports'] as const,
  summaries: () => [...reportKeys.all, 'summary'] as const,
  summary: (params: ReportSummaryParams = {}) => [...reportKeys.summaries(), params] as const,
};
