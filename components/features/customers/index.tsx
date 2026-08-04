'use client';

import { useMemo } from 'react';
import { ArrowDownIcon, ArrowUpIcon, SearchIcon, UsersIcon } from 'lucide-react';

import { EmptyState } from '@/components/custom/empty-state';
import { PageHeader } from '@/components/custom/page-header';
import {
  DataTablePaginationBar,
  DataTableSelectionHeader,
  DataTableToolbar,
} from '@/components/custom/data-table';
import type { DataTableColumn } from '@/lib/data-table/types';
import { exportRowsToCsv, useClientDataTable } from '@/hooks/use-client-data-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { cn } from '@/lib/utils';
import { useBookings } from '@/stores/queries/booking';

type CustomerRow = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bookingCount: number;
  lastBookingAt: string;
};

const matchesSearch = (customer: CustomerRow, q: string) => {
  const haystack = [customer.name, customer.email, customer.phone, customer.bookingCount]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
};

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
    <button
      type="button"
      className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground"
      onClick={onClick}
    >
      {label}
      {active &&
        (direction === 'asc' ? (
          <ArrowUpIcon className="size-3" />
        ) : (
          <ArrowDownIcon className="size-3" />
        ))}
    </button>
  );
}

export function CustomersPage() {
  const { data: bookings = [], isLoading, isError, error } = useBookings({ limit: '200' });

  const customers = useMemo(() => {
    const map = new Map<string, CustomerRow>();

    bookings.forEach((booking) => {
      const customerKey = booking.customerPhone || booking.user?.id;
      if (!customerKey) return;

      const existing = map.get(customerKey);
      const name = booking.customerName || booking.user?.name || 'Khách';
      const email = booking.user?.email;
      const phone = booking.customerPhone || booking.user?.phone;

      if (!existing) {
        map.set(customerKey, {
          id: customerKey,
          name,
          email,
          phone,
          bookingCount: 1,
          lastBookingAt: booking.createdAt,
        });
        return;
      }

      map.set(customerKey, {
        ...existing,
        name: existing.name || name,
        phone: existing.phone || phone,
        bookingCount: existing.bookingCount + 1,
        lastBookingAt:
          new Date(booking.createdAt) > new Date(existing.lastBookingAt)
            ? booking.createdAt
            : existing.lastBookingAt,
      });
    });

    return Array.from(map.values());
  }, [bookings]);

  const columns = useMemo<DataTableColumn<CustomerRow>[]>(
    () => [
      {
        id: 'name',
        header: 'Tên',
        sortable: true,
        sortValue: (row) => row.name,
        cell: (row) => <span className="font-medium">{row.name}</span>,
      },
      {
        id: 'email',
        header: 'Email',
        sortable: true,
        sortValue: (row) => row.email ?? '',
        cell: (row) => <span className="text-muted-foreground">{row.email ?? '—'}</span>,
      },
      {
        id: 'phone',
        header: 'Điện thoại',
        sortable: true,
        sortValue: (row) => row.phone ?? '',
        cell: (row) => <span className="text-muted-foreground">{row.phone ?? '—'}</span>,
      },
      {
        id: 'bookingCount',
        header: 'Lượt đặt',
        sortable: true,
        sortValue: (row) => row.bookingCount,
        className: 'text-right',
        cell: (row) => <span className="tabular-nums">{row.bookingCount}</span>,
      },
      {
        id: 'lastBooking',
        header: 'Đặt gần nhất',
        sortable: true,
        sortValue: (row) => row.lastBookingAt,
        className: 'hidden md:table-cell',
        cell: (row) => (
          <span className="tabular-nums text-muted-foreground">
            {formatDate(row.lastBookingAt)}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useClientDataTable({
    data: customers,
    columns,
    getRowId: (row) => row.id,
    searchPredicate: matchesSearch,
    initialPageSize: 20,
  });

  const isSearching = table.search.trim().length > 0;
  const isNotEmpty = table.allRows.length > 0;
  const pageAllSelected =
    table.pageRows.length > 0 && table.pageRows.every((row) => table.selectedIds.has(row.id));

  const handleExport = () => {
    exportRowsToCsv(table.allRows, table.visibleColumns, 'customers.csv');
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Khách hàng"
        icon={UsersIcon}
        actions={
          customers.length > 0 ? (
            <Badge variant="secondary" className="font-semibold tabular-nums">
              {table.allRows.length}
            </Badge>
          ) : undefined
        }
      />

      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Tìm khách hàng…"
        selectedCount={table.selectedIds.size}
        onClearSelection={table.clearSelection}
        columns={table.allColumns as DataTableColumn<unknown>[]}
        hiddenColumns={table.hiddenColumns}
        onToggleColumn={table.toggleColumn}
        onExport={handleExport}
      />

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được danh sách khách hàng'}
        </div>
      )}

      {isLoading && !isError && <Skeleton className="h-32 w-full rounded-xl" />}

      {!isLoading && !isError && isNotEmpty && (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 px-3 py-3">
                  <DataTableSelectionHeader
                    checked={pageAllSelected}
                    onCheckedChange={() => table.toggleAllPageRows()}
                  />
                </TableHead>
                {table.visibleColumns.map((column) => (
                  <TableHead key={column.id} className={cn('px-4 py-3 text-xs', column.className)}>
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
              {table.pageRows.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-foreground/3">
                  <TableCell className="px-3 py-3.5">
                    <Checkbox
                      checked={table.selectedIds.has(customer.id)}
                      onCheckedChange={() => table.toggleRow(customer.id)}
                      aria-label={`Chọn ${customer.name}`}
                    />
                  </TableCell>
                  {table.visibleColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn('px-4 py-3.5 text-sm', column.className)}
                    >
                      {column.cell(customer)}
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
          icon={isSearching ? SearchIcon : UsersIcon}
          title={isSearching ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng'}
          description={
            isSearching
              ? `Không có kết quả khớp với “${table.search}”.`
              : 'Khách sẽ xuất hiện khi có booking walk-in hoặc đặt sân online.'
          }
          action={
            isSearching ? { label: 'Xóa tìm kiếm', onClick: () => table.setSearch('') } : undefined
          }
        />
      )}
    </div>
  );
}
