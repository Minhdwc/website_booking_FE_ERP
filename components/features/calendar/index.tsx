'use client';

import { useMemo, useState } from 'react';
import { CalendarRange, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { PageHeader } from '@/components/custom/page-header';
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
import { BookingStatus, IBooking, IVenue } from '@/stores/api/types';
import { useBookings } from '@/stores/queries/booking';
import { useCourts } from '@/stores/queries/court';
import { useVenues } from '@/stores/queries/venue';

type ViewMode = 'day' | 'week' | 'month';

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

const STATUS_FILTERS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'waiting_payment', label: 'Chờ TT' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Huỷ' },
  { value: 'expired', label: 'Hết hạn' },
];

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

type CalendarRow = {
  key: string;
  date: string;
  courtName: string;
  booking: IBooking;
  item: NonNullable<IBooking['items']>[number];
};

export function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [venueFilter, setVenueFilter] = useState<string>();
  const [courtFilter, setCourtFilter] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInPrefill, setWalkInPrefill] = useState<WalkInInitialValues>();
  const [blockOpen, setBlockOpen] = useState(false);
  const [editBookingId, setEditBookingId] = useState<string>();
  const [editOpen, setEditOpen] = useState(false);

  const { data: bookings = [], isLoading } = useBookings({ limit: '200' });
  const { data: venues = [] } = useVenues({ limit: '100' });
  const { data: courts = [] } = useCourts({
    limit: '100',
    ...(venueFilter ? { venueId: venueFilter } : {}),
  });

  const dateRange = useMemo(() => {
    if (viewMode === 'day') {
      const day = toLocalIsoDate(anchorDate);
      return { from: day, to: day, label: formatDate(day) };
    }
    if (viewMode === 'month') {
      const start = startOfMonth(anchorDate);
      const end = endOfMonth(anchorDate);
      return {
        from: toLocalIsoDate(start),
        to: toLocalIsoDate(end),
        label: anchorDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
      };
    }
    const weekStart = startOfWeek(anchorDate);
    const weekEnd = addDays(weekStart, 6);
    return {
      from: toLocalIsoDate(weekStart),
      to: toLocalIsoDate(weekEnd),
      label: `${formatDate(toLocalIsoDate(weekStart))} – ${formatDate(toLocalIsoDate(weekEnd))}`,
    };
  }, [anchorDate, viewMode]);

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        bookingMatchesFilters(booking, {
          from: dateRange.from,
          to: dateRange.to,
          venueId: venueFilter,
          courtId: courtFilter,
          status: statusFilter,
        }),
      ),
    [bookings, courtFilter, dateRange.from, dateRange.to, statusFilter, venueFilter],
  );

  const rows = useMemo(() => {
    const list: CalendarRow[] = [];
    filteredBookings.forEach((booking) => {
      booking.items?.forEach((item) => {
        const day = normalizeDateKey(item.date);
        if (day < dateRange.from || day > dateRange.to) return;
        if (
          venueFilter &&
          item.court?.venueId !== venueFilter &&
          item.court?.venue?.id !== venueFilter
        )
          return;
        if (courtFilter && item.courtId !== courtFilter) return;
        const courtName = item.court?.name ?? item.courtId;
        list.push({
          key: `${booking.id}|${item.id ?? `${day}|${courtName}`}`,
          date: day,
          courtName,
          booking,
          item,
        });
      });
    });
    return list.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.item.startTime.localeCompare(b.item.startTime);
    });
  }, [courtFilter, dateRange.from, dateRange.to, filteredBookings, venueFilter]);

  const monthDays = useMemo(() => {
    if (viewMode !== 'month') return [];
    const start = startOfMonth(anchorDate);
    const end = endOfMonth(anchorDate);
    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      days.push(new Date(d));
    }
    return days;
  }, [anchorDate, viewMode]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row) => {
      map.set(row.date, (map.get(row.date) ?? 0) + 1);
    });
    return map;
  }, [rows]);

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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Lịch sân"
        description="Xem lịch đặt theo ngày/tuần/tháng, lọc theo cơ sở và sân."
        icon={CalendarRange}
        actions={
          <div className="flex gap-2">
            <BookingGate.Create>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openWalkIn({ date: dateRange.from })}
              >
                Walk-in
              </Button>
            </BookingGate.Create>
            <Button size="sm" variant="outline" onClick={() => setBlockOpen(true)}>
              Block sân
            </Button>
          </div>
        }
      />

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <TabsList>
          <TabsTrigger value="day">Ngày</TabsTrigger>
          <TabsTrigger value="week">Tuần</TabsTrigger>
          <TabsTrigger value="month">Tháng</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3 lg:flex-1">
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

        <Select
          value={venueFilter || '__all__'}
          onValueChange={(value) => {
            setVenueFilter(!value || value === '__all__' ? undefined : value);
            setCourtFilter(undefined);
          }}
        >
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Cơ sở" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả cơ sở</SelectItem>
            {venues.map((venue: IVenue) => (
              <SelectItem key={venue.id} value={venue.id}>
                {venue.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={courtFilter || '__all__'}
          onValueChange={(value) =>
            setCourtFilter(!value || value === '__all__' ? undefined : value)
          }
        >
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Sân" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả sân</SelectItem>
            {courts.map((court) => (
              <SelectItem key={court.id} value={court.id}>
                {court.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            type="button"
            variant={statusFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {viewMode === 'day' && (
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-heading">Khung giờ theo sân</h2>
          {courtFilter ? (
            <DaySlotGrid
              courtId={courtFilter}
              courtName={courts.find((court) => court.id === courtFilter)?.name ?? 'Sân'}
              date={dateRange.from}
              bookings={bookings}
              onWalkIn={openWalkIn}
              onBookingDetail={openBookingDetail}
            />
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Chọn sân ở bộ lọc phía trên để xem lưới slot và tạo walk-in nhanh.
              </p>
              <div className="flex flex-wrap gap-2">
                {courts.slice(0, 8).map((court) => (
                  <Button
                    key={court.id}
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => setCourtFilter(court.id)}
                  >
                    {court.name}
                  </Button>
                ))}
              </div>
            </div>
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
                <TableHead className="w-24 text-right">Thao tác</TableHead>
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
                        Walk-in
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
