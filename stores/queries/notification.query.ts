'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { INotification } from '@/stores/api/types';
import {
  notificationService,
  type NotificationPage,
  type NotificationResponse,
  type NotificationUnreadCountResponse,
} from '@/stores/service/notification.service';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: () => [...notificationKeys.lists()] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

const fetchNotifications = async (): Promise<INotification[]> => {
  const response = await notificationService.getNotifications();
  const page = (response as NotificationResponse).data as NotificationPage;
  return page?.data ?? [];
};

const fetchUnreadCount = async (): Promise<number> => {
  const response = await notificationService.getUnreadCount();
  return (response as NotificationUnreadCountResponse).data ?? 0;
};

export const useNotifications = () =>
  useQuery({
    queryKey: notificationKeys.list(),
    queryFn: fetchNotifications,
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
