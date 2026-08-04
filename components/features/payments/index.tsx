'use client';

import { useCallback, useMemo } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanknoteIcon,
  SearchIcon,
} from 'lucide-react';

import { PaymentGate } from '@/components/auth/permission-gates';
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
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { IPayment, PaymentMethod, PaymentStatus } from '@/stores/api/types';
import { usePayments } from '@/stores/queries/payment';

const methodLabel: Record<PaymentMethod, string> = {
  bank_transfer: 'Chuyển khoản',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
  vnpay: 'VNPay',
};

const statusLabel: Record<PaymentStatus, string> = {
  pending: 'Chờ xử lý',
  success: 'Thành công',
  failed: 'Thất bại',
  cancelled: 'Huỷ',
};

const statusVariant: Record<PaymentStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  success: 'default',
  failed: 'destructive',
  cancelled: 'outline',
};

const matchesSearch = (payment: IPayment, q: string) => {
  const haystack = [
    payment.booking?.bookingCode,
    payment.transactionCode,
    payment.method,
    payment.status,
    payment.amount,
  ]
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
    <button type="button" className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={onClick}>
      {label}
      {active && (direction === 'asc' ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />)}
    </button>
  );
}

export function PaymentsPage() {
  const { data: payments = [], isLoading, isError, error } = usePayments({ limit: '100' });

  const columns = useMemo<DataTableColumn<IPayment>[]>(
    () => [
      {
        id: 'booking',
        header: 'Mã đặt sân',
        sortable: true,
        sortValue: (row) => row.booking?.bookingCode ?? '',
        cell: (row) => (
          <span className="font-mono text-xs">{row.booking?.bookingCode ?? row.bookingId.slice(0, 8)}</span>
        ),
      },
      {
        id: 'amount',
        header: 'Số tiền',
        sortable: true,
        sortValue: (row) => row.amount,
        cell: (row) => <span className="font-medium tabular-nums">{formatCurrency(row.amount)}</span>,
      },
      {
        id: 'method',
        header: 'Phương thức',
        sortable: true,
        sortValue: (row) => row.method,
        cell: (row) => methodLabel[row.method] ?? row.method,
      },
      {
        id: 'status',
        header: 'Trạng thái',
        sortable: true,
        sortValue: (row) => row.status,
        cell: (row) => (
          <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
        ),
      },
      {
        id: 'paidAt',
        header: 'Thanh toán lúc',
        sortable: true,
        sortValue: (row) => row.paidAt ?? row.createdAt,
        className: 'hidden md:table-cell',
        cell: (row) => (
          <span className="tabular-nums text-muted-foreground">
            {row.paidAt ? formatDate(row.paidAt) : '—'}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: 'Tạo lúc',
        sortable: true,
        sortValue: (row) => row.createdAt,
        className: 'hidden lg:table-cell',
        defaultVisible: false,
        cell: (row) => <span className="tabular-nums text-muted-foreground">{formatDate(row.createdAt)}</span>,
      },
    ],
    [],
  );

  const table = useClientDataTable({
    data: payments,
    columns,
    getRowId: (row) => row.id,
    searchPredicate: matchesSearch,
    initialPageSize: 20,
  });

  const isSearching = table.search.trim().length > 0;
  const isNotEmpty = table.allRows.length > 0;
  const pageAllSelected =
    table.pageRows.length > 0 && table.pageRows.every((row) => table.selectedIds.has(row.id));

  const handleExport = useCallback(() => {
    exportRowsToCsv(table.allRows, table.visibleColumns, 'payments.csv');
  }, [table.allRows, table.visibleColumns]);

  return (
    <PaymentGate.View>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
        <PageHeader
          title="Thanh toán"
          description="Theo dõi giao dịch thanh toán từ đặt sân."
          icon={BanknoteIcon}
          actions={
            payments.length > 0 ? (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {table.allRows.length}
              </Badge>
            ) : undefined
          }
        />

        <DataTableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Tìm giao dịch…"
          selectedCount={table.selectedIds.size}
          onClearSelection={table.clearSelection}
          columns={table.allColumns as DataTableColumn<unknown>[]}
          hiddenColumns={table.hiddenColumns}
          onToggleColumn={table.toggleColumn}
          onExport={handleExport}
        />

        {isError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : 'Không tải được danh sách thanh toán'}
          </div>
        )}

        {isLoading && !isError && (
          <div className="space-y-3 rounded-xl border bg-card p-4">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!isLoading && !isError && isNotEmpty && (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
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
                {table.pageRows.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-foreground/3">
                    <TableCell className="px-3 py-3.5">
                      <Checkbox
                        checked={table.selectedIds.has(payment.id)}
                        onCheckedChange={() => table.toggleRow(payment.id)}
                        aria-label={`Chọn ${payment.id}`}
                      />
                    </TableCell>
                    {table.visibleColumns.map((column) => (
                      <TableCell key={column.id} className={cn('px-4 py-3.5 text-sm', column.className)}>
                        {column.cell(payment)}
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
            icon={isSearching ? SearchIcon : BanknoteIcon}
            title={isSearching ? 'Không tìm thấy giao dịch' : 'Chưa có giao dịch'}
            description={
              isSearching
                ? `Không có kết quả khớp với “${table.search}”.`
                : 'Giao dịch sẽ hiện khi khách thanh toán đặt sân.'
            }
            action={
              isSearching ? { label: 'Xóa tìm kiếm', onClick: () => table.setSearch('') } : undefined
            }
          />
        )}
      </div>
    </PaymentGate.View>
  );
}
