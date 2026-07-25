'use client';

import { useMemo } from 'react';
import { CalendarDaysIcon, MoreHorizontalIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/custom/empty-state';
import { PageHeader } from '@/components/custom/page-header';
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
import { formatCurrency, formatDate } from '@/lib/format';
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
  paid_at_venue: 'Thanh toán tại quầy',
};

const statusVariant: Record<BookingStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  waiting_payment: 'secondary',
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'outline',
  expired: 'outline',
  paid_at_venue: 'default',
};

const getBookingCustomerName = (booking: IBooking) =>
  booking.customerName || booking.user?.name || 'Khách';

const getBookingCustomerContact = (booking: IBooking) =>
  booking.customerPhone || booking.user?.phone || booking.user?.email || booking.userId;

function formatSlotTime(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

const matchesSearch = (booking: IBooking, q: string) => {
  const primaryItem = booking.items?.[0];
  const haystack = [
    booking.customerName,
    booking.customerPhone,
    booking.user?.name,
    booking.user?.email,
    booking.user?.phone,
    primaryItem?.court?.name,
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

const statusFilters: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'waiting_payment', label: 'Chờ TT' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã huỷ' },
  { value: 'expired', label: 'Hết hạn' },
];

export const BookingsPage = () => {
  const bookingSearch = useErpUiStore((state) => state.bookingSearch);
  const setBookingSearch = useErpUiStore((state) => state.setBookingSearch);
  const bookingStatusFilter = useErpUiStore((state) => state.bookingStatusFilter);
  const setBookingStatusFilter = useErpUiStore((state) => state.setBookingStatusFilter);
  const deleteBookingMutation = useDeleteBooking();

  const { data: bookingsData, isSuccess, isLoading, isError, error } = useBookings();
  const bookings = isSuccess ? bookingsData : [];

  const filtered = useMemo(() => {
    let result = bookings;
    if (bookingStatusFilter !== 'all') {
      result = result.filter((booking: IBooking) => booking.status === bookingStatusFilter);
    }
    if (bookingSearch.trim()) {
      result = result.filter((booking: IBooking) => matchesSearch(booking, bookingSearch.trim()));
    }
    return result;
  }, [bookings, bookingSearch, bookingStatusFilter]);

  const isNotEmpty = filtered.length > 0;
  const isSearching = bookingSearch.trim().length > 0;
  const isFilteringByStatus = bookingStatusFilter !== 'all';

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
      <PageHeader
        title="Đặt sân"
        description="Theo dõi giữ chỗ và xác nhận lịch đặt sân của khách."
        icon={CalendarDaysIcon}
        actions={
          <>
            {bookings.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {filtered.length}
              </Badge>
            )}
            <BookingsCreateDialog />
          </>
        }
      />

      <InputGroup className="h-9 w-full max-w-md rounded-xl border-border/70 bg-card shadow-sm">
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

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            type="button"
            variant={bookingStatusFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
            onClick={() => setBookingStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

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
              <TableRow className="border-b border-border/60 bg-muted/40 hover:bg-transparent">
                <TableHead className="px-4 py-3 text-xs">Mã</TableHead>
                <TableHead className="px-4 py-3 text-xs">Khách</TableHead>
                <TableHead className="px-4 py-3 text-xs">Sân</TableHead>
                <TableHead className="hidden px-4 py-3 text-xs lg:table-cell">Ngày</TableHead>
                <TableHead className="hidden px-4 py-3 text-xs md:table-cell">Khung giờ</TableHead>
                <TableHead className="px-4 py-3 text-xs text-right">Số tiền</TableHead>
                <TableHead className="px-4 py-3 text-xs">Trạng thái</TableHead>
                <TableHead className="w-28 px-4 py-3 text-right text-xs">
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
                    <TableCell className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {booking.bookingCode}
                    </TableCell>
                    <TableCell className="max-w-45 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {getBookingCustomerName(booking)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {getBookingCustomerContact(booking)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-sm text-muted-foreground">
                      {primaryItem?.court?.name || '—'}
                    </TableCell>
                    <TableCell className="hidden px-4 py-2.5 text-sm tabular-nums lg:table-cell">
                      {primaryItem ? formatDate(primaryItem.date) : '—'}
                    </TableCell>
                    <TableCell className="hidden px-4 py-2.5 text-sm tabular-nums text-muted-foreground md:table-cell">
                      {primaryItem
                        ? `${formatSlotTime(primaryItem.startTime)} – ${formatSlotTime(primaryItem.endTime)}`
                        : '—'}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-right text-sm font-medium tabular-nums">
                      {formatCurrency(booking.finalAmount)}
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <BookingStatusCell booking={booking} />
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {booking.status === 'waiting_payment' ? (
                          <DialogEditBooking
                            bookingId={booking.id}
                            triggerLabel="Xác nhận"
                            triggerClassName="h-8 rounded-lg px-2.5 text-xs font-medium text-primary hover:bg-primary/10"
                          />
                        ) : null}
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && !isError && !isNotEmpty && (
        <EmptyState
          icon={isSearching || isFilteringByStatus ? SearchIcon : CalendarDaysIcon}
          title={
            isSearching || isFilteringByStatus
              ? 'Không tìm thấy đặt sân nào'
              : 'Chưa có đặt sân nào'
          }
          description={
            isSearching
              ? `Không có kết quả khớp với “${bookingSearch}”.`
              : isFilteringByStatus
                ? `Không có đặt sân ở trạng thái “${statusFilters.find((f) => f.value === bookingStatusFilter)?.label}”.`
                : 'Tạo đặt sân đầu tiên hoặc chờ khách đặt qua app.'
          }
          action={
            isSearching
              ? { label: 'Xóa tìm kiếm', onClick: () => setBookingSearch('') }
              : isFilteringByStatus
                ? { label: 'Xóa bộ lọc', onClick: () => setBookingStatusFilter('all') }
                : undefined
          }
        />
      )}
    </div>
  );
};
