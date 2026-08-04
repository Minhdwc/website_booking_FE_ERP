'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import { INotification } from '@/stores/api/types';
import {
  notificationService,
  NotificationUnreadCountResponse,
} from '@/stores/service/notification.service';

import { notificationKeys, type NotificationListParams } from './keys';

const fetchNotifications = async (params?: NotificationListParams): Promise<INotification[]> => {
  const response = await notificationService.getNotifications({
    limit: params?.limit ?? '50',
    ...(params?.page ? { page: params.page } : {}),
  });
  return unwrapList(response.data);
};

const fetchUnreadCount = async (): Promise<number> => {
  const response = await notificationService.getUnreadCount();
  if (typeof response === 'number') return response;

  const count = (response as NotificationUnreadCountResponse).data;
  return typeof count === 'number' ? count : 0;
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
