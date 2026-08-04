'use client';

import { useCallback, useMemo } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarDaysIcon,
  MoreHorizontalIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react';

import { EmptyState } from '@/components/custom/empty-state';
import { PageHeader } from '@/components/custom/page-header';
import {
  DataTablePaginationBar,
  DataTableSelectionHeader,
  DataTableToolbar,
} from '@/components/custom/data-table';
import type { DataTableColumn } from '@/lib/data-table/types';
import { exportRowsToCsv, useClientDataTable } from '@/hooks/use-client-data-table';
import { BookingsCreateDialog } from '@/components/features/bookings/dialog-create';
import { DialogEditBooking } from '@/components/features/bookings/dialog-edit';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { BookingGate } from '@/components/auth/permission-gates';
import { showApiErrorToast } from '@/lib/api/handle-api-error';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BookingStatus, IBooking } from '@/stores/api/types';
import { useErpUiStore } from '@/stores/index.store';
import { useBookings, useDeleteBooking } from '@/stores/queries/booking';
import { toast } from 'sonner';

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

const statusFilters: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'waiting_payment', label: 'Chờ TT' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã huỷ' },
  { value: 'expired', label: 'Hết hạn' },
];

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

function BookingStatusCell({ booking }: { booking: IBooking }) {
  const expiresAt =
    booking.status === 'waiting_payment' ? booking.expiresAt : undefined;
  const { formatted, remainingMs, isExpired } = useCountdown(expiresAt);

  if (booking.status === 'waiting_payment' && booking.expiresAt) {
    if (isExpired) {
      return <Badge variant={statusVariant.waiting_payment}>{statusLabel.waiting_payment}</Badge>;
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

  return (
    <Badge variant={statusVariant[booking.status as BookingStatus]}>
      {statusLabel[booking.status as BookingStatus]}
    </Badge>
  );
}

function SortLabel({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: 'asc' | 'desc';
  onClick: () => void;
}) {
  return (
    <button type="button" className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={onClick}>
      {label}
      {active && (direction === 'asc' ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />)}
    </button>
  );
}

export const BookingsPage = () => {
  const bookingStatusFilter = useErpUiStore((state) => state.bookingStatusFilter);
  const setBookingStatusFilter = useErpUiStore((state) => state.setBookingStatusFilter);
  const deleteBookingMutation = useDeleteBooking();

  const { data: bookingsData, isSuccess, isLoading, isError, error } = useBookings();
  const bookings = useMemo(
    () => (isSuccess ? bookingsData ?? [] : []),
    [isSuccess, bookingsData],
  );

  const handleDelete = useCallback(
    async (bookingId: string) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa đặt sân này không?')) return;
      try {
        await deleteBookingMutation.mutateAsync(bookingId);
        toast.success('Xóa đặt sân thành công');
      } catch (err) {
        showApiErrorToast(err, 'Không xóa được đặt sân');
      }
    },
    [deleteBookingMutation],
  );

  const statusFiltered = useMemo(() => {
    if (bookingStatusFilter === 'all') return bookings;
    return bookings.filter((booking) => booking.status === bookingStatusFilter);
  }, [bookings, bookingStatusFilter]);

  const columns = useMemo<DataTableColumn<IBooking>[]>(
    () => [
      {
        id: 'code',
        header: 'Mã',
        sortable: true,
        sortValue: (row) => row.bookingCode,
        cell: (row) => (
          <span className="font-mono text-xs text-muted-foreground">{row.bookingCode}</span>
        ),
      },
      {
        id: 'customer',
        header: 'Khách',
        sortable: true,
        sortValue: (row) => getBookingCustomerName(row),
        cell: (row) => (
          <div className="min-w-0 max-w-45">
            <p className="truncate font-medium">{getBookingCustomerName(row)}</p>
            <p className="truncate text-xs text-muted-foreground">{getBookingCustomerContact(row)}</p>
          </div>
        ),
      },
      {
        id: 'court',
        header: 'Sân',
        sortable: true,
        sortValue: (row) => row.items?.[0]?.court?.name ?? '',
        cell: (row) => row.items?.[0]?.court?.name || '—',
      },
      {
        id: 'date',
        header: 'Ngày',
        sortable: true,
        sortValue: (row) => row.items?.[0]?.date ?? '',
        className: 'hidden lg:table-cell',
        cell: (row) => (row.items?.[0] ? formatDate(row.items[0].date) : '—'),
      },
      {
        id: 'slot',
        header: 'Khung giờ',
        className: 'hidden md:table-cell',
        sortValue: (row) => row.items?.[0]?.startTime ?? '',
        cell: (row) => {
          const item = row.items?.[0];
          return item
            ? `${formatSlotTime(item.startTime)} – ${formatSlotTime(item.endTime)}`
            : '—';
        },
      },
      {
        id: 'amount',
        header: 'Số tiền',
        sortable: true,
        sortValue: (row) => row.finalAmount,
        cell: (row) => (
          <span className="font-medium tabular-nums">{formatCurrency(row.finalAmount)}</span>
        ),
      },
      {
        id: 'status',
        header: 'Trạng thái',
        sortable: true,
        sortValue: (row) => row.status,
        cell: (row) => <BookingStatusCell booking={row} />,
      },
      {
        id: 'actions',
        header: '',
        cell: (row) => <BookingRowActions booking={row} onDelete={handleDelete} />,
      },
    ],
    [handleDelete],
  );

  const table = useClientDataTable({
    data: statusFiltered,
    columns,
    getRowId: (row) => row.id,
    searchPredicate: matchesSearch,
    initialPageSize: 20,
  });

  const isSearching = table.search.trim().length > 0;
  const isFilteringByStatus = bookingStatusFilter !== 'all';
  const isNotEmpty = table.allRows.length > 0;
  const pageAllSelected =
    table.pageRows.length > 0 && table.pageRows.every((row) => table.selectedIds.has(row.id));

  const handleExport = () => {
    const exportColumns = table.allColumns.filter(
      (column) => column.id !== 'actions' && !table.hiddenColumns.has(column.id),
    );
    exportRowsToCsv(table.allRows, exportColumns, 'bookings.csv');
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
                {table.allRows.length}
              </Badge>
            )}
            <BookingGate.Create>
              <BookingsCreateDialog />
            </BookingGate.Create>
          </>
        }
      />

      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Tìm đặt sân…"
        selectedCount={table.selectedIds.size}
        onClearSelection={table.clearSelection}
        columns={table.allColumns as DataTableColumn<unknown>[]}
        hiddenColumns={table.hiddenColumns}
        onToggleColumn={table.toggleColumn}
        onExport={handleExport}
      />

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
                <TableHead className="w-10 px-3 py-3">
                  <DataTableSelectionHeader
                    checked={pageAllSelected}
                    onCheckedChange={() => table.toggleAllPageRows()}
                  />
                </TableHead>
                {table.visibleColumns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn('px-4 py-3 text-xs', column.className)}
                  >
                    {column.sortable ? (
                      <SortLabel
                        label={column.header}
                        active={table.sortBy === column.id}
                        direction={table.sortDirection}
                        onClick={() => table.toggleSort(column.id)}
                      />
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.pageRows.map((booking) => (
                <TableRow
                  key={booking.id}
                  className="group border-b border-border/40 last:border-b-0 hover:bg-foreground/3"
                >
                  <TableCell className="px-3 py-2.5">
                    <Checkbox
                      checked={table.selectedIds.has(booking.id)}
                      onCheckedChange={() => table.toggleRow(booking.id)}
                      aria-label={`Chọn ${booking.bookingCode}`}
                    />
                  </TableCell>
                  {table.visibleColumns.map((column) => (
                    <TableCell key={column.id} className={cn('px-4 py-2.5 text-sm', column.className)}>
                      {column.cell(booking)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DataTablePaginationBar
            pagination={table.pagination}
            onPageChange={table.setPage}
            onPageSizeChange={(size) => {
              table.setPageSize(size);
              table.setPage(1);
            }}
          />
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
              ? `Không có kết quả khớp với “${table.search}”.`
              : isFilteringByStatus
                ? `Không có đặt sân ở trạng thái “${statusFilters.find((f) => f.value === bookingStatusFilter)?.label}”.`
                : 'Tạo đặt sân đầu tiên hoặc chờ khách đặt qua app.'
          }
          action={
            isSearching
              ? { label: 'Xóa tìm kiếm', onClick: () => table.setSearch('') }
              : isFilteringByStatus
                ? { label: 'Xóa bộ lọc', onClick: () => setBookingStatusFilter('all') }
                : undefined
          }
        />
      )}
    </div>
  );
};

function BookingRowActions({
  booking,
  onDelete,
}: {
  booking: IBooking;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {booking.status === 'waiting_payment' ? (
        <BookingGate.ConfirmPayment>
          <DialogEditBooking
            bookingId={booking.id}
            triggerLabel="Xác nhận"
            triggerClassName="h-8 rounded-lg px-2.5 text-xs font-medium text-primary hover:bg-primary/10"
          />
        </BookingGate.ConfirmPayment>
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
          <BookingGate.Edit>
            <DialogEditBooking bookingId={booking.id} />
          </BookingGate.Edit>
          <BookingGate.Delete>
            <Separator className="my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 font-normal text-destructive hover:text-destructive"
              onClick={() => onDelete(booking.id)}
            >
              <Trash2Icon className="size-3.5" />
              Xóa
            </Button>
          </BookingGate.Delete>
        </PopoverContent>
      </Popover>
    </div>
  );
}
