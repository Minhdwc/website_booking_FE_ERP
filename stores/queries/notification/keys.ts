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
