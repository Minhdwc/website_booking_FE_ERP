'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  notificationService,
  type NotificationPage,
  type NotificationResponse,
  type NotificationUnreadCountResponse,
} from '@/stores/service/notification.service';
import type { INotification } from '@/stores/api/types';

export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

type NotificationContextValue = {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isMarkingRead: boolean;
  isMarkingAll: boolean;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

async function fetchNotifications(): Promise<INotification[]> {
  const response = await notificationService.getNotifications();
  const page = (response as NotificationResponse).data as NotificationPage;
  return page?.data ?? [];
}

async function fetchUnreadCount(): Promise<number> {
  const response = await notificationService.getUnreadCount();
  return (response as NotificationUnreadCountResponse).data ?? 0;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: notificationKeys.all,
    queryFn: fetchNotifications,
  });

  const unreadQuery = useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });

  const markAsRead = useCallback(
    async (id: string) => {
      await markAsReadMutation.mutateAsync(id);
    },
    [markAsReadMutation],
  );

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications: listQuery.data ?? [],
      unreadCount: unreadQuery.data ?? 0,
      isLoading: listQuery.isLoading || unreadQuery.isLoading,
      isError: listQuery.isError || unreadQuery.isError,
      markAsRead,
      markAllAsRead,
      isMarkingRead: markAsReadMutation.isPending,
      isMarkingAll: markAllAsReadMutation.isPending,
    }),
    [
      listQuery.data,
      listQuery.isLoading,
      listQuery.isError,
      unreadQuery.data,
      unreadQuery.isLoading,
      unreadQuery.isError,
      markAsRead,
      markAllAsRead,
      markAsReadMutation.isPending,
      markAllAsReadMutation.isPending,
    ],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification phải được dùng trong NotificationProvider');
  }
  return context;
}
