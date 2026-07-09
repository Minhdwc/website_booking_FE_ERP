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
  getBookings: async () => {
    const response = await apiRequest('/bookings', { method: 'GET' });
    return response;
  },

  getBooking: async (id: string) => {
    const response = await apiRequest(`/bookings/${id}`, { method: 'GET' });
    return response;
  },

  createBooking: async (body: {
    userId: string;
    fieldId: string;
    timeslotId: string;
    date: string;
    status?: BookingStatus;
  }) => {
    const response = await apiRequest('/bookings', { method: 'POST', body });
    return response;
  },

  updateBooking: async (id: string, body: { value: IBooking }) => {
    const response = await apiRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: { value: body.value },
    });
    return response;
  },

  deleteBooking: async (id: string) => {
    const response = await apiRequest(`/bookings/${id}`, { method: 'DELETE' });
    return response;
  },
};
