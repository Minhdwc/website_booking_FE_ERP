import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { INotification } from '@/stores/api/types';

export interface NotificationResponse {
  status: string;
  message: string;
  data: Response<INotification>;
}

export interface NotificationDetailResponse {
  status: string;
  message: string;
  data: INotification;
}

export interface NotificationsResponse {
  status: string;
  message: string;
  data: INotification[];
}

export interface NotificationUnreadCountResponse {
  status: string;
  message: string;
  data: number;
}

export const notificationService = {
  getNotifications: (params?: { page?: string; limit?: string }) =>
    apiRequest<NotificationResponse>('/notifications', { method: 'GET', params }),

  getUnreadCount: () =>
    apiRequest<NotificationUnreadCountResponse>('/notifications/unread-count', { method: 'GET' }),

  markAsRead: (id: string) =>
    apiRequest<NotificationDetailResponse>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllAsRead: () =>
    apiRequest<NotificationsResponse>('/notifications/read-all', { method: 'PATCH' }),
};
