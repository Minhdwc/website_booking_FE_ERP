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
  getNotifications: async () => {
    const response = await apiRequest('/notifications', { method: 'GET' });
    return response;
  },

  getUnreadCount: async () => {
    const response = await apiRequest('/notifications/unread-count', { method: 'GET' });
    return response;
  },

  markAsRead: async (id: string) => {
    const response = await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
    return response;
  },

  markAllAsRead: async () => {
    const response = await apiRequest('/notifications/read-all', { method: 'PATCH' });
    return response;
  },
};
