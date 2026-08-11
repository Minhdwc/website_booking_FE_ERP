'use client';

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
import { cn } from '@/lib/utils';
import { useCustomers } from '@/stores/queries/booking';
import type { ICustomer } from '@/stores/api/types';

import { customerColumns } from './columns';

const matchesSearch = (customer: ICustomer, query: string) => {
  const haystack = [customer.email, customer.bookingCount].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(query.toLowerCase());
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
  const { data: customers = [], isLoading, isError, error } = useCustomers({ limit: '200' });

  const table = useClientDataTable({
    data: customers,
    columns: customerColumns,
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
                      aria-label={`Chọn ${customer.email ?? customer.id}`}
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
