import { apiRequest, ApiResponse } from '@/lib/api/client';
import {
  Booking,
  Field,
  Notification,
  Payment,
  Review,
  Sport,
  Timeslot,
  User,
  Venue,
} from '@/lib/api/types';

type ResourcePath =
  | 'bookings'
  | 'fields'
  | 'notifications'
  | 'payments'
  | 'reviews'
  | 'sports'
  | 'timeslots'
  | 'users'
  | 'venues';

function resource<T>(path: ResourcePath) {
  return {
    list: (token?: string) => apiRequest<ApiResponse<T[]>>(`/${path}`, { token }),
    get: (id: string, token?: string) => apiRequest<ApiResponse<T>>(`/${path}/${id}`, { token }),
    create: <Payload>(body: Payload, token?: string) =>
      apiRequest<ApiResponse<T>>(`/${path}`, {
        method: 'POST',
        body,
        token,
      }),
    update: <Payload>(id: string, body: Payload, token?: string) =>
      apiRequest<ApiResponse<T>>(`/${path}/${id}`, {
        method: 'PUT',
        body,
        token,
      }),
    remove: (id: string, token?: string) =>
      apiRequest<{ message: string }>(`/${path}/${id}`, {
        method: 'DELETE',
        token,
      }),
  };
}

export const api = {
  auth: {
    login: (body: { email: string; password: string }) =>
      apiRequest<{
        message: string;
        accessToken: string;
        refreshToken: string;
      }>('/auth/login', { method: 'POST', body }),
    register: (body: unknown) =>
      apiRequest<ApiResponse<User>>('/auth/register', {
        method: 'POST',
        body,
      }),
  },
  bookings: resource<Booking>('bookings'),
  fields: resource<Field>('fields'),
  notifications: {
    ...resource<Notification>('notifications'),
    mine: (token: string) =>
      apiRequest<ApiResponse<Notification[]>>('/notifications/me', { token }),
    markRead: (id: string, token: string) =>
      apiRequest<ApiResponse<Notification>>(`/notifications/${id}/read`, {
        method: 'PATCH',
        token,
      }),
  },
  payments: resource<Payment>('payments'),
  reviews: resource<Review>('reviews'),
  sports: resource<Sport>('sports'),
  timeslots: resource<Timeslot>('timeslots'),
  users: resource<User>('users'),
  venues: resource<Venue>('venues'),
};
