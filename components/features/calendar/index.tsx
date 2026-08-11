'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarRange, ChevronLeftIcon, ChevronRightIcon, RefreshCwIcon } from 'lucide-react';

import { PageHeader } from '@/components/custom/page-header';
import { ComboboxCourts } from '@/components/custom/combobox/combobox-fields';
import { ComboboxVenue } from '@/components/custom/combobox/combobox-venue';
import {
  BookingCreateDialog,
  type WalkInInitialValues,
} from '@/components/features/bookings/dialog-create';
import { BookingEditDialog } from '@/components/features/bookings/dialog-edit';
import { CourtBlockDialog } from '@/components/features/calendar/dialog-court-block';
import { DaySlotGrid } from '@/components/features/calendar/day-slot-grid';
import { BookingGate } from '@/components/auth/permission-gates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDate, normalizeDateKey, toLocalIsoDate } from '@/lib/format';
import { BookingStatus, IBooking } from '@/stores/api/types';
import { useBookings } from '@/stores/queries/booking';
import { courtKeys, useCourts } from '@/stores/queries/court';

const STATUS_LABEL: Record<BookingStatus, string> = {
  waiting_payment: 'Chờ TT',
  confirmed: 'Đã xác nhận',
  cancelled: 'Huỷ',
  completed: 'Hoàn thành',
  expired: 'Hết hạn',
  paid_at_venue: 'Tại quầy',
};

const STATUS_VARIANT: Record<BookingStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  waiting_payment: 'secondary',
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'outline',
  expired: 'outline',
  paid_at_venue: 'default',
};

const STATUS_OPTIONS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'waiting_payment', label: 'Chờ thanh toán' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã huỷ' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'paid_at_venue', label: 'Thanh toán tại quầy' },
];

const STATUS_SELECT_ITEMS = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<BookingStatus | 'all', string>;

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

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatSlotTime(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

function getBookingCustomerName(booking: IBooking) {
  return booking.customerName || booking.user?.name || 'Khách';
}

function bookingMatchesFilters(
  booking: IBooking,
  filters: {
    from: string;
    to: string;
    venueId?: string;
    courtId?: string;
    status: BookingStatus | 'all';
  },
) {
  if (filters.status !== 'all' && booking.status !== filters.status) return false;

  return booking.items?.some((item) => {
    const day = normalizeDateKey(item.date);
    if (day < filters.from || day > filters.to) return false;
    if (
      filters.venueId &&
      item.court?.venueId !== filters.venueId &&
      item.court?.venue?.id !== filters.venueId
    ) {
      return false;
    }
    if (filters.courtId && item.courtId !== filters.courtId) return false;
    return true;
  });
}

export function CalendarPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [venueId, setVenueId] = useState<string>();
  const [courtId, setCourtId] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInPrefill, setWalkInPrefill] = useState<WalkInInitialValues>();
  const [blockOpen, setBlockOpen] = useState(false);
  const [editBookingId, setEditBookingId] = useState<string>();
  const [editOpen, setEditOpen] = useState(false);

  const { data: bookings = [], isLoading, isFetching, refetch } = useBookings({ limit: '200' });
  const { data: courts = [] } = useCourts({
    limit: '100',
    ...(venueId ? { venueId } : {}),
  });

  let dateRange: { from: string; to: string; label: string };
  if (viewMode === 'day') {
    const day = toLocalIsoDate(anchorDate);
    dateRange = { from: day, to: day, label: formatDate(day) };
  } else if (viewMode === 'month') {
    const start = startOfMonth(anchorDate);
    const end = endOfMonth(anchorDate);
    dateRange = {
      from: toLocalIsoDate(start),
      to: toLocalIsoDate(end),
      label: anchorDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
    };
  } else {
    const weekStart = startOfWeek(anchorDate);
    const weekEnd = addDays(weekStart, 6);
    dateRange = {
      from: toLocalIsoDate(weekStart),
      to: toLocalIsoDate(weekEnd),
      label: `${formatDate(toLocalIsoDate(weekStart))} – ${formatDate(toLocalIsoDate(weekEnd))}`,
    };
  }

  const filteredBookings = bookings.filter((booking) =>
    bookingMatchesFilters(booking, {
      from: dateRange.from,
      to: dateRange.to,
      venueId,
      courtId,
      status: statusFilter,
    }),
  );

  const rows = filteredBookings
    .flatMap((booking) =>
      (booking.items ?? [])
        .filter((item) => {
          const day = normalizeDateKey(item.date);
          if (day < dateRange.from || day > dateRange.to) return false;
          if (venueId && item.court?.venueId !== venueId && item.court?.venue?.id !== venueId)
            return false;
          if (courtId && item.courtId !== courtId) return false;
          return true;
        })
        .map((item) => {
          const day = normalizeDateKey(item.date);
          const courtName = item.court?.name ?? item.courtId;
          return {
            key: `${booking.id}|${item.id ?? `${day}|${courtName}`}`,
            date: day,
            courtName,
            booking,
            item,
          };
        }),
    )
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.item.startTime.localeCompare(b.item.startTime);
    });

  const monthDays: Date[] = [];
  if (viewMode === 'month') {
    const start = startOfMonth(anchorDate);
    const end = endOfMonth(anchorDate);
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      monthDays.push(new Date(d));
    }
  }

  const bookingsByDay = new Map<string, number>();
  rows.forEach((row) => {
    bookingsByDay.set(row.date, (bookingsByDay.get(row.date) ?? 0) + 1);
  });

  const shiftAnchor = (delta: number) => {
    setAnchorDate((current) => {
      if (viewMode === 'day') return addDays(current, delta);
      if (viewMode === 'month')
        return new Date(current.getFullYear(), current.getMonth() + delta, 1);
      return addDays(current, delta * 7);
    });
  };

  const openBookingDetail = (bookingId: string) => {
    setEditBookingId(bookingId);
    setEditOpen(true);
  };

  const openWalkIn = (prefill?: WalkInInitialValues) => {
    setWalkInPrefill(prefill);
    setWalkInOpen(true);
  };

  const handleVenueChange = (nextVenueId?: string) => {
    setVenueId(nextVenueId);
    setCourtId(undefined);
  };

  const handleRefresh = () => {
    setVenueId(undefined);
    setCourtId(undefined);
    setStatusFilter('all');
    void refetch();
    void queryClient.invalidateQueries({ queryKey: courtKeys.all });
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-4 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Lịch sân"
        icon={CalendarRange}
        actions={
          <div className="flex flex-wrap gap-2">
            <BookingGate.Create>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  openWalkIn({ date: dateRange.from, ...(courtId ? { courtId } : {}) })
                }
              >
                Khách vãng lai
              </Button>
            </BookingGate.Create>
            <Button size="sm" variant="outline" onClick={() => setBlockOpen(true)}>
              Khóa sân
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value)}>
            <TabsList>
              <TabsTrigger value="day">Ngày</TabsTrigger>
              <TabsTrigger value="week">Tuần</TabsTrigger>
              <TabsTrigger value="month">Tháng</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3">
          <Button size="sm" variant="outline" onClick={() => shiftAnchor(-1)}>
            <ChevronLeftIcon className="size-3.5" />
            Trước
          </Button>
          <p className="text-sm font-medium">{dateRange.label}</p>
          <Button size="sm" variant="outline" onClick={() => shiftAnchor(1)}>
            Sau
            <ChevronRightIcon className="size-3.5" />
          </Button>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
          <ComboboxVenue value={venueId} onChange={handleVenueChange} />

          {venueId && <ComboboxCourts venueId={venueId} value={courtId} onChange={setCourtId} />}

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as BookingStatus | 'all')}
            items={STATUS_SELECT_ITEMS}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label="Làm mới"
            disabled={isFetching}
            onClick={handleRefresh}
          >
            <RefreshCwIcon className={cn('size-4', isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {viewMode === 'day' && (
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-heading">Khung giờ theo sân</h2>
          {courtId ? (
            <DaySlotGrid
              courtId={courtId}
              courtName={courts.find((court) => court.id === courtId)?.name ?? 'Sân'}
              date={dateRange.from}
              bookings={bookings}
              onWalkIn={openWalkIn}
              onBookingDetail={openBookingDetail}
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {venueId
                ? 'Chọn sân để xem lưới khung giờ và đặt khách vãng lai.'
                : 'Chọn cơ sở và sân để xem lưới khung giờ.'}
            </p>
          )}
        </div>
      )}

      {viewMode === 'month' && (
        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((day) => {
            const key = toLocalIsoDate(day);
            const count = bookingsByDay.get(key) ?? 0;
            const isToday = key === toLocalIsoDate(new Date());
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setAnchorDate(day);
                  setViewMode('day');
                }}
                className={cn(
                  'cursor-pointer rounded-lg border border-border/60 bg-card p-2 text-center text-xs transition-colors hover:border-brand-300 hover:bg-brand-50/50',
                  isToday && 'border-brand-400 ring-1 ring-brand-200',
                )}
              >
                <p className="font-semibold">{day.getDate()}</p>
                {count > 0 ? (
                  <Badge variant="secondary" className="mt-1 tabular-nums">
                    {count}
                  </Badge>
                ) : (
                  <p className="mt-1 text-muted-foreground">—</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            Không có booking trong khoảng thời gian này.
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
                <TableHead className="w-28 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.key}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => openBookingDetail(row.booking.id)}
                >
                  <TableCell>{formatDate(row.date)}</TableCell>
                  <TableCell>{row.courtName}</TableCell>
                  <TableCell>
                    {`${formatSlotTime(row.item.startTime)} – ${formatSlotTime(row.item.endTime)}`}
                  </TableCell>
                  <TableCell>{getBookingCustomerName(row.booking)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[row.booking.status]}>
                      {STATUS_LABEL[row.booking.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                    <BookingGate.Create>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          openWalkIn({
                            courtId: row.item.courtId,
                            date: row.date,
                            startTime: formatSlotTime(row.item.startTime),
                            endTime: formatSlotTime(row.item.endTime),
                          })
                        }
                      >
                        Vãng lai
                      </Button>
                    </BookingGate.Create>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <BookingCreateDialog
        open={walkInOpen}
        onOpenChange={(next) => {
          setWalkInOpen(next);
          if (!next) setWalkInPrefill(undefined);
        }}
        initialValues={walkInPrefill}
      />
      <CourtBlockDialog open={blockOpen} onOpenChange={setBlockOpen} />

      {editBookingId && (
        <BookingEditDialog
          bookingId={editBookingId}
          open={editOpen}
          onOpenChange={(next) => {
            setEditOpen(next);
            if (!next) setEditBookingId(undefined);
          }}
        />
      )}
    </div>
  );
}
