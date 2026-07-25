'use client';

import { useMemo, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/custom/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import { BookingStatus, IBooking } from '@/stores/api/types';
import { useBookings } from '@/stores/queries/booking.query';

const STATUS_LABEL: Record<BookingStatus, string> = {
  waiting_payment: 'Chờ TT',
  confirmed: 'Đã xác nhận',
  cancelled: 'Huỷ',
  completed: 'Hoàn thành',
  expired: 'Hết hạn',
  paid_at_venue: 'Tại quầy',
};

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatSlotTime(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

export function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const { data: bookings = [], isLoading } = useBookings({ limit: '200' });

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const weekBookings = useMemo(() => {
    const from = toIsoDate(weekDays[0]);
    const to = toIsoDate(weekDays[6]);
    return bookings.filter((booking) =>
      booking.items?.some((item) => item.date >= from && item.date <= to),
    );
  }, [bookings, weekDays]);

  const rows = useMemo(() => {
    const map = new Map<string, IBooking[]>();
    weekBookings.forEach((booking) => {
      booking.items?.forEach((item) => {
        const key = `${item.date}|${item.court?.name ?? item.courtId}`;
        const list = map.get(key) ?? [];
        list.push(booking);
        map.set(key, list);
      });
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [weekBookings]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Lịch sân"
        description="Xem lịch đặt theo tuần — walk-in và block sân sẽ bổ sung ở sprint tiếp theo."
      />

      <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setWeekStart((current) => addDays(current, -7))}
        >
          <ChevronLeftIcon className="size-3.5" />
          Tuần trước
        </Button>
        <p className="text-sm font-medium">
          {formatDate(toIsoDate(weekDays[0]))} – {formatDate(toIsoDate(weekDays[6]))}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setWeekStart((current) => addDays(current, 7))}
        >
          Tuần sau
          <ChevronRightIcon className="size-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className="rounded-lg border border-border/60 bg-card p-2 text-center text-xs"
          >
            <p className="font-semibold">{day.toLocaleDateString('vi-VN', { weekday: 'short' })}</p>
            <p className="text-muted-foreground">{day.getDate()}/{day.getMonth() + 1}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            Không có booking trong tuần này.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Sân</TableHead>
                <TableHead>Giờ</TableHead>
                <TableHead>Khách</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(([key, list]) => {
                const [date, courtName] = key.split('|');
                const booking = list[0];
                const item = booking.items?.find(
                  (entry) => entry.date === date && (entry.court?.name ?? entry.courtId) === courtName,
                );
                return (
                  <TableRow key={key}>
                    <TableCell>{formatDate(date)}</TableCell>
                    <TableCell>{courtName}</TableCell>
                    <TableCell>
                      {item ? `${formatSlotTime(item.startTime)} – ${formatSlotTime(item.endTime)}` : '—'}
                    </TableCell>
                    <TableCell>{booking.user?.name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{STATUS_LABEL[booking.status]}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.message('Walk-in modal — dùng POST /bookings/walk-in')}
        >
          Walk-in
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.message('Block sân — dùng POST /courts/:id/blocks')}
        >
          Block sân
        </Button>
      </div>
    </div>
  );
}
