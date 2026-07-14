import { apiRequest } from '@/stores/api/api-request';
import { BookingStatus, IBooking } from '@/stores/api/types';

export interface BookingResponse {
  status: number;
  message: string;
  data: BookingPage;
}

export interface BookingPage {
  page: number;
  limit: number;
  total: number;
  data: IBooking[];
}

export interface BookingDetailResponse {
  status: number;
  message: string;
  data: IBooking;
}

export interface BookingsResponse {
  status: number;
  message: string;
  data: IBooking[];
}

export const bookingService = {
  getBookings: () => apiRequest<BookingResponse>('/bookings', { method: 'GET' }),

  getBooking: (id: string) =>
    apiRequest<BookingDetailResponse>(`/bookings/${id}`, { method: 'GET' }),

  createBooking: (body: {
    userId: string;
    fieldId: string;
    timeslotId: string;
    date: string;
    status?: BookingStatus;
  }) => apiRequest<BookingDetailResponse>('/bookings', { method: 'POST', body }),

  updateBooking: (id: string, body: Partial<IBooking>) =>
    apiRequest<BookingDetailResponse>(`/bookings/${id}`, {
      method: 'PATCH',
      body,
    }),

  deleteBooking: (id: string) =>
    apiRequest<BookingDetailResponse>(`/bookings/${id}`, { method: 'DELETE' }),
};
