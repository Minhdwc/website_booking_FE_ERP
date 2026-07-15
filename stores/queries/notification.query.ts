'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import { INotification } from '@/stores/api/types';
import {
  notificationService,
  NotificationUnreadCountResponse,
} from '@/stores/service/notification.service';

export type NotificationListParams = {
  page?: string;
  limit?: string;
};

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: NotificationListParams = {}) => [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

const fetchNotifications = async (params?: NotificationListParams): Promise<INotification[]> => {
  const response = await notificationService.getNotifications({
    limit: params?.limit ?? '50',
    ...(params?.page ? { page: params.page } : {}),
  });
  return unwrapList(response.data);
};

const fetchUnreadCount = async (): Promise<number> => {
  const response = await notificationService.getUnreadCount();
  return (response as NotificationUnreadCountResponse).data ?? 0;
};

export const useNotifications = (params?: NotificationListParams) =>
  useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => fetchNotifications(params),
    staleTime: 0,
  });

export const useNotificationUnreadCount = () =>
  useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: fetchUnreadCount,
    staleTime: 0,
    refetchInterval: 60_000,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};
