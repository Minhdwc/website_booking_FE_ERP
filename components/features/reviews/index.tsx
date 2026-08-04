'use client';

import { useCallback, useMemo } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MoreHorizontalIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
} from 'lucide-react';
import { toast } from 'sonner';

import { ReviewGate } from '@/components/auth/permission-gates';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { showApiErrorToast } from '@/lib/api/handle-api-error';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { IReview } from '@/stores/api/types';
import { useDeleteReview, useReviews } from '@/stores/queries/review';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon
          key={index}
          className={cn(
            'size-3.5',
            index < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
          )}
        />
      ))}
    </div>
  );
}

const matchesSearch = (review: IReview, q: string) => {
  const haystack = [
    review.user?.name,
    review.user?.email,
    review.venue?.name,
    review.comment,
    review.rating,
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

export function ReviewsPage() {
  const { data, isSuccess, isLoading, isError, error } = useReviews({ limit: '100' });
  const reviews = isSuccess ? data : [];
  const deleteMutation = useDeleteReview();

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Xóa đánh giá này?')) return;
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Đã xóa đánh giá');
      } catch (err) {
        showApiErrorToast(err, 'Không xóa được đánh giá');
      }
    },
    [deleteMutation],
  );

  const columns = useMemo<DataTableColumn<IReview>[]>(
    () => [
      {
        id: 'customer',
        header: 'Khách',
        sortable: true,
        sortValue: (row) => row.user?.name ?? '',
        cell: (row) => (
          <div>
            <p className="font-medium">{row.user?.name ?? 'Khách'}</p>
            <p className="text-xs text-muted-foreground">{row.user?.email ?? row.userId}</p>
          </div>
        ),
      },
      {
        id: 'venue',
        header: 'Cơ sở',
        sortable: true,
        sortValue: (row) => row.venue?.name ?? '',
        cell: (row) => <span className="text-muted-foreground">{row.venue?.name ?? '—'}</span>,
      },
      {
        id: 'rating',
        header: 'Rating',
        sortable: true,
        sortValue: (row) => row.rating,
        cell: (row) => <Stars rating={row.rating} />,
      },
      {
        id: 'comment',
        header: 'Nhận xét',
        sortable: true,
        sortValue: (row) => row.comment ?? '',
        className: 'hidden md:table-cell max-w-xs',
        cell: (row) => (
          <span className="block truncate text-muted-foreground">{row.comment || '—'}</span>
        ),
      },
      {
        id: 'date',
        header: 'Ngày',
        sortable: true,
        sortValue: (row) => row.createdAt,
        cell: (row) => <span className="tabular-nums">{formatDate(row.createdAt)}</span>,
      },
      {
        id: 'actions',
        header: '',
        cell: (row) => <ReviewRowActions reviewId={row.id} onDelete={handleDelete} />,
      },
    ],
    [handleDelete],
  );

  const table = useClientDataTable({
    data: reviews,
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
    const exportColumns = table.allColumns.filter(
      (column) => column.id !== 'actions' && !table.hiddenColumns.has(column.id),
    );
    exportRowsToCsv(table.allRows, exportColumns, 'reviews.csv');
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Đánh giá"
        description="Kiểm duyệt đánh giá của khách trên các cơ sở."
        icon={StarIcon}
        actions={
          reviews.length > 0 ? (
            <Badge variant="secondary" className="font-semibold tabular-nums">
              {table.allRows.length}
            </Badge>
          ) : undefined
        }
      />

      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Tìm đánh giá…"
        selectedCount={table.selectedIds.size}
        onClearSelection={table.clearSelection}
        columns={table.allColumns as DataTableColumn<unknown>[]}
        hiddenColumns={table.hiddenColumns}
        onToggleColumn={table.toggleColumn}
        onExport={handleExport}
      />

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được danh sách đánh giá'}
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
              <TableRow className="border-b border-border/60 bg-card hover:bg-transparent">
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
              {table.pageRows.map((review) => (
                <TableRow key={review.id} className="group hover:bg-foreground/3">
                  <TableCell className="px-3 py-3.5">
                    <Checkbox
                      checked={table.selectedIds.has(review.id)}
                      onCheckedChange={() => table.toggleRow(review.id)}
                      aria-label={`Chọn đánh giá ${review.id}`}
                    />
                  </TableCell>
                  {table.visibleColumns.map((column) => (
                    <TableCell key={column.id} className={cn('px-4 py-3.5 text-sm', column.className)}>
                      {column.cell(review)}
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
          icon={isSearching ? SearchIcon : StarIcon}
          title={isSearching ? 'Không tìm thấy đánh giá' : 'Chưa có đánh giá'}
          description={
            isSearching
              ? `Không có kết quả khớp với “${table.search}”.`
              : 'Khi khách viết đánh giá, danh sách sẽ hiện ở đây.'
          }
          action={
            isSearching ? { label: 'Xóa tìm kiếm', onClick: () => table.setSearch('') } : undefined
          }
        />
      )}
    </div>
  );
}

function ReviewRowActions({
  reviewId,
  onDelete,
}: {
  reviewId: string;
  onDelete: (id: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground opacity-60 group-hover:opacity-100"
          />
        }
      >
        <MoreHorizontalIcon className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-36 gap-0 p-1">
        <ReviewGate.Delete>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 font-normal text-destructive hover:text-destructive"
            onClick={() => onDelete(reviewId)}
          >
            <Trash2Icon className="size-3.5" />
            Xóa
          </Button>
        </ReviewGate.Delete>
      </PopoverContent>
    </Popover>
  );
}
