'use client';

import { useState } from 'react';
import { BellIcon } from 'lucide-react';

import { formatRelativeTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationUnreadCount,
  useNotifications,
} from '@/stores/queries/notification.query';
import { INotification } from '@/stores/api/types';

export function Notification() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [], isLoading, isError } = useNotifications();
  const { data: unreadCount = 0 } = useNotificationUnreadCount();
  const markAsReadMutation = useMarkNotificationRead();
  const markAllAsReadMutation = useMarkAllNotificationsRead();

  const handleItemClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markAsReadMutation.mutateAsync(id);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative size-11 rounded-2xl"
            aria-label="Thông báo"
          />
        }
      >
        <BellIcon className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-brand-secondary-600 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle>Thông báo</SheetTitle>
              <SheetDescription>
                {unreadCount > 0
                  ? `Bạn có ${unreadCount} thông báo chưa đọc`
                  : 'Không có thông báo mới'}
              </SheetDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-xs"
                disabled={markAllAsReadMutation.isPending}
                onClick={() => markAllAsReadMutation.mutateAsync()}
              >
                Đọc tất cả
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5.5rem)]">
          <div className="flex flex-col">
            {isLoading && (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isError && !isLoading && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Không tải được thông báo. Vui lòng thử lại sau.
              </p>
            )}

            {!isLoading && !isError && notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Chưa có thông báo nào.
              </p>
            )}

            {!isLoading &&
              !isError &&
              notifications.map((item: INotification) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id, item.isRead)}
                  className="flex gap-3 border-b border-border px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-secondary-50 text-brand-secondary-700">
                    <BellIcon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      {!item.isRead && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-brand-secondary-600" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">{item.message}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/80">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
