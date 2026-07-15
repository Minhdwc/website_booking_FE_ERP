import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { BookingStatus, IBooking } from '@/stores/api/types';

export interface BookingResponse {
  status: number;
  message: string;
  data: Response<IBooking>;
}

export interface BookingDetailResponse {
  status: number;
  message: string;
  data: IBooking;
}

export const bookingService = {
  getBookings: (params?: { search?: string; page?: string; limit?: string }) =>
    apiRequest<BookingResponse>('/bookings', { method: 'GET', params }),

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
