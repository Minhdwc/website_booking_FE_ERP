import { apiRequest } from '@/stores/api/api-request';

export type ReportBookingStatusRow = {
  status: string;
  count: number;
};

export type ReportTopField = {
  fieldId: string;
  bookingCount: number;
  field: {
    id: string;
    name: string;
    venueId: string;
    venue: { name: string } | null;
  } | null;
};

export type ReportSummary = {
  bookingsByStatus: ReportBookingStatusRow[];
  revenue: {
    total: number;
    paidCount: number;
    from: string | null;
    to: string | null;
  };
  topFields: ReportTopField[];
};

export type ReportSummaryResponse = {
  statusCode: number;
  message: string;
  data: ReportSummary;
};

export const reportService = {
  getSummary: (params?: { from?: string; to?: string }) =>
    apiRequest<ReportSummaryResponse>('/reports/summary', {
      method: 'GET',
      params,
    }),
};
