import { apiRequest } from '@/stores/api/api-request';
import { BookingStatus, IBooking } from '@/stores/api/types';

export interface BookingResponse {
  status: string;
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
  status: string;
  message: string;
  data: IBooking;
}

export interface BookingsResponse {
  status: string;
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

  updateBooking: (id: string, body: { value: IBooking }) =>
    apiRequest<BookingDetailResponse>(`/bookings/${id}`, {
      method: 'PUT',
      body: { value: body.value },
    }),

  deleteBooking: (id: string) =>
    apiRequest<BookingDetailResponse>(`/bookings/${id}`, { method: 'DELETE' }),
};
