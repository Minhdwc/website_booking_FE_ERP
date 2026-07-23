import { apiRequest } from '@/stores/api/api-request';

export type AnalyticsOverview = {
  period: { from: string | null; to: string | null };
  bookings: {
    total: number;
    byStatus: Array<{ status: string; count: number }>;
    conversionRate: number;
    waitingPayment: number;
  };
  payments: {
    byStatus: Array<{ status: string; count: number; amount: number }>;
    successRate: number;
  };
  revenue: {
    total: number;
    averageOrderValue: number;
    paidCount: number;
  };
  topVenues: Array<{
    venueId: string;
    bookingCount: number;
    venue: { id: string; name: string; location: string } | null;
  }>;
};

export type AnalyticsOverviewResponse = {
  statusCode: number;
  message: string;
  data: AnalyticsOverview;
};

export const analyticsService = {
  getOverview: (params?: { from?: string; to?: string }) =>
    apiRequest<AnalyticsOverviewResponse>('/analytics/overview', {
      method: 'GET',
      params,
    }),
};
