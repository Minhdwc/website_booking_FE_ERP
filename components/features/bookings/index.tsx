'use client';

import { CalendarDaysIcon, MoreHorizontalIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import { BookingsCreateDialog } from '@/components/features/bookings/dialog-create';
import { DialogEditBooking } from '@/components/features/bookings/dialog-edit';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCountdown } from '@/hooks/use-countdown';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BookingStatus, IBooking } from '@/stores/api/types';
import { useErpUiStore } from '@/stores/index.store';
import { useBookings, useDeleteBooking } from '@/stores/queries/booking.query';

const statusLabel: Record<BookingStatus, string> = {
  waiting_payment: 'Chờ thanh toán',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã huỷ',
  completed: 'Hoàn thành',
  expired: 'Hết hạn',
};

const statusVariant: Record<BookingStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  waiting_payment: 'secondary',
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'outline',
  expired: 'outline',
};

function formatSlotTime(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

const matchesSearch = (booking: IBooking, q: string) => {
  const primaryItem = booking.items?.[0];
  const haystack = [
    booking.user?.name,
    booking.user?.email,
    booking.user?.phone,
    primaryItem?.field?.name,
    primaryItem?.date,
    booking.bookingCode,
    booking.status,
    booking.id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
};

function HoldBadge({ expiresAt }: { expiresAt: string }) {
  const { formatted, remainingMs, isExpired } = useCountdown(expiresAt);

  if (isExpired) {
    return <Badge variant="outline">Hết hạn giữ chỗ</Badge>;
  }

  const underTwoMinutes = remainingMs < 2 * 60 * 1000;
  const underFiveMinutes = remainingMs < 5 * 60 * 1000;

  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium tabular-nums',
        underTwoMinutes && 'bg-red-100 text-red-800 hover:bg-red-100',
        !underTwoMinutes && underFiveMinutes && 'bg-amber-100 text-amber-900 hover:bg-amber-100',
        !underFiveMinutes && 'bg-amber-50 text-amber-800 hover:bg-amber-50',
      )}
    >
      Đang giữ chỗ · còn {formatted}
    </Badge>
  );
}

function BookingStatusCell({ booking }: { booking: IBooking }) {
  if (booking.status === 'waiting_payment' && booking.expiresAt) {
    return <PendingBookingStatus expiresAt={booking.expiresAt} />;
  }

  return (
    <Badge variant={statusVariant[booking.status as BookingStatus]}>
      {statusLabel[booking.status as BookingStatus]}
    </Badge>
  );
}

function PendingBookingStatus({ expiresAt }: { expiresAt: string }) {
  const { isExpired } = useCountdown(expiresAt);

  if (isExpired) {
    return <Badge variant={statusVariant.waiting_payment}>{statusLabel.waiting_payment}</Badge>;
  }

  return <HoldBadge expiresAt={expiresAt} />;
}

export const BookingsPage = () => {
  const bookingSearch = useErpUiStore((state) => state.bookingSearch);
  const setBookingSearch = useErpUiStore((state) => state.setBookingSearch);
  const deleteBookingMutation = useDeleteBooking();

  const { data: bookingsData, isSuccess, isLoading, isError, error } = useBookings();
  const bookings = isSuccess ? bookingsData : [];

  const filtered = bookingSearch.trim()
    ? bookings.filter((booking: IBooking) => matchesSearch(booking, bookingSearch.trim()))
    : bookings;

  const isNotEmpty = filtered.length > 0;
  const isSearching = bookingSearch.trim().length > 0;

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đặt sân này không?')) return;
    try {
      await deleteBookingMutation.mutateAsync(bookingId);
      toast.success('Xóa đặt sân thành công');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không xóa được đặt sân');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Đặt sân</h1>
            {bookings.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {filtered.length}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Theo dõi giữ chỗ và xác nhận lịch đặt sân của khách.
          </p>
        </div>

        <BookingsCreateDialog />
      </header>

      <InputGroup className="h-9 w-full max-w-55 rounded-xl border-border/70 bg-card shadow-sm">
        <InputGroupAddon>
          <SearchIcon className="size-3.5" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Tìm đặt sân…"
          className="text-sm"
          value={bookingSearch}
          onChange={(event) => setBookingSearch(event.target.value)}
        />
        {isSearching && (
          <InputGroupAddon align="inline-end">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Xoá tìm kiếm"
              onClick={() => setBookingSearch('')}
            >
              <XIcon />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được danh sách đặt sân'}
        </div>
      )}

      {isLoading && !isError && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="space-y-0 divide-y divide-border/40">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center gap-4 px-4 py-4">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !isError && isNotEmpty && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-card hover:bg-transparent">
                <TableHead className="px-4 py-3 text-xs">Khách</TableHead>
                <TableHead className="px-4 py-3 text-xs">Sân</TableHead>
                <TableHead className="px-4 py-3 text-xs">Ngày</TableHead>
                <TableHead className="hidden px-4 py-3 text-xs md:table-cell">Khung giờ</TableHead>
                <TableHead className="px-4 py-3 text-xs">Trạng thái</TableHead>
                <TableHead className="w-14 px-4 py-3 text-right text-xs">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((booking: IBooking) => {
                const primaryItem = booking.items?.[0];
                return (
                  <TableRow
                    key={booking.id}
                    className="group border-b border-border/40 last:border-b-0 hover:bg-foreground/3"
                  >
                    <TableCell className="max-w-55 px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground">
                          <CalendarDaysIcon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {booking.user?.name || 'Khách'}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {booking.user?.email || booking.userId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                      {primaryItem?.field?.name || '—'}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-sm tabular-nums">
                      {primaryItem ? formatDate(primaryItem.date) : '—'}
                    </TableCell>
                    <TableCell className="hidden px-4 py-3.5 text-sm tabular-nums text-muted-foreground md:table-cell">
                      {primaryItem
                        ? `${formatSlotTime(primaryItem.startTime)} – ${formatSlotTime(primaryItem.endTime)}`
                        : '—'}
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      <BookingStatusCell booking={booking} />
                    </TableCell>
                    <TableCell className="px-3 py-3.5 text-right">
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Mở thao tác"
                              className="text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100 aria-expanded:opacity-100"
                            />
                          }
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-44 gap-0 p-1">
                          <DialogEditBooking bookingId={booking.id} />
                          <Separator className="my-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 font-normal text-destructive hover:text-destructive"
                            onClick={() => handleDelete(booking.id)}
                          >
                            <Trash2Icon className="size-3.5" />
                            Xóa
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && !isError && !isNotEmpty && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {isSearching ? (
              <SearchIcon className="size-5" />
            ) : (
              <CalendarDaysIcon className="size-5" />
            )}
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            {isSearching ? 'Không tìm thấy đặt sân nào' : 'Chưa có đặt sân nào'}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {isSearching
              ? `Không có kết quả khớp với “${bookingSearch}”.`
              : 'Tạo đặt sân đầu tiên hoặc chờ khách đặt qua app.'}
          </p>
          {isSearching ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setBookingSearch('')}
            >
              <XIcon className="size-3.5" />
              Xoá tìm kiếm
            </Button>
          ) : (
            <div className="mt-4">
              <BookingsCreateDialog />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
