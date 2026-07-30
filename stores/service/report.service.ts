import { apiRequest } from '@/stores/api/api-request';

export type ReportBookingStatusRow = {
  status: string;
  count: number;
};

export type ReportTopCourt = {
  courtId: string;
  bookingCount: number;
  court: {
    id: string;
    name: string;
    venueId: string;
    venue: { name: string } | null;
  } | null;
};

export type ReportRevenueByDay = {
  date: string;
  total: number;
};

export type ReportRevenueBySport = {
  sportId: string;
  sportName: string;
  total: number;
};

export type ReportSummary = {
  bookingsByStatus: ReportBookingStatusRow[];
  revenue: {
    total: number;
    paidCount: number;
    from: string | null;
    to: string | null;
  };
  topCourts: ReportTopCourt[];
  revenueByDay: ReportRevenueByDay[];
  revenueBySport: ReportRevenueBySport[];
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

  downloadCsv: async (params?: { from?: string; to?: string }) => {
    const searchParams = new URLSearchParams({ export: 'csv' });
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);

    const response = await apiRequest(`/reports/summary?${searchParams}`, {
      method: 'GET',
      params,
    });

    return response as any;
  },
};
