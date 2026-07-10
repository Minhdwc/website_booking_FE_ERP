import { apiRequest } from '@/stores/api/api-request';
import { INotification } from '@/stores/api/types';

export interface NotificationResponse {
  status: string;
  message: string;
  data: NotificationPage;
}

export interface NotificationPage {
  page: number;
  limit: number;
  total: number;
  data: INotification[];
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
  getNotifications: () => apiRequest<NotificationResponse>('/notifications', { method: 'GET' }),

  getUnreadCount: () =>
    apiRequest<NotificationUnreadCountResponse>('/notifications/unread-count', { method: 'GET' }),

  markAsRead: (id: string) =>
    apiRequest<NotificationDetailResponse>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllAsRead: () =>
    apiRequest<NotificationsResponse>('/notifications/read-all', { method: 'PATCH' }),
};
