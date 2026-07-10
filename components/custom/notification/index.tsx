'use client';

import { useState } from 'react';
import { BellIcon } from 'lucide-react';
import { Icon } from '@iconify/react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const mockNotifications = [
  {
    id: '1',
    title: 'Đặt sân chờ xác nhận',
    description: 'Có 3 đơn đặt sân mới cần xử lý.',
    time: '5 phút trước',
    unread: true,
    icon: 'mdi:calendar-check-outline',
  },
  {
    id: '2',
    title: 'Thanh toán thành công',
    description: 'Giao dịch #PAY-2041 đã được xác nhận.',
    time: '1 giờ trước',
    unread: true,
    icon: 'mdi:cash-check',
  },
  {
    id: '3',
    title: 'Đánh giá mới',
    description: 'Khách hàng vừa để lại đánh giá 5 sao.',
    time: 'Hôm qua',
    unread: false,
    icon: 'mdi:star-outline',
  },
];

export function Notification() {
  const [open, setOpen] = useState(false);
  const unreadCount = mockNotifications.filter((item) => item.unread).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="relative" aria-label="Thông báo" />
        }
      >
        <BellIcon className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle>Thông báo</SheetTitle>
          <SheetDescription>
            {unreadCount > 0
              ? `Bạn có ${unreadCount} thông báo chưa đọc`
              : 'Không có thông báo mới'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5.5rem)]">
          <div className="flex flex-col">
            {mockNotifications.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex gap-3 border-b border-border px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon icon={item.icon} className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    {item.unread && (
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{item.description}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/80">{item.time}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
