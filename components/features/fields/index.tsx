'use client';

import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  LandPlotIcon,
  MoreHorizontalIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { formatCurrency } from '@/lib/format';
import { DialogCreateField } from '@/components/features/fields/dialog-create-field';
import { DialogEditField } from '@/components/features/fields/dialog-edit-field';
import { FieldsSetupPage } from '@/components/features/fields/setup-page';
import { CourtGate } from '@/components/auth/permission-gates';
import {
  DataTablePaginationBar,
  DataTableSelectionHeader,
  DataTableToolbar,
} from '@/components/custom/data-table';
import { PageHeader } from '@/components/custom/page-header';
import type { DataTableColumn } from '@/lib/data-table/types';
import { exportRowsToCsv, useClientDataTable } from '@/hooks/use-client-data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { showApiErrorToast } from '@/lib/api/handle-api-error';
import { cn } from '@/lib/utils';
import { CourtStatus, ICourt, IVenue } from '@/stores/api/types';
import { useErpUiStore } from '@/stores/index.store';
import { prefetchCourt, useCourts, useDeleteCourt } from '@/stores/queries/court';
import { useVenues } from '@/stores/queries/venue';

const formatDurationMinutes = (minutes: number) => {
  if (!minutes || minutes < 0) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return hours === 1 ? '1 giờ' : `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
};

const statusLabel: Record<CourtStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Ngưng',
  maintenance: 'Bảo trì',
};

const statusVariant: Record<CourtStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  inactive: 'outline',
  maintenance: 'secondary',
};

const matchesSearch = (court: ICourt, q: string) => {
  const haystack = [
    court.name,
    court.description,
    court.venue?.name,
    court.sport?.name,
    court.status,
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

export const FieldsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fieldVenueFilter = useErpUiStore((state) => state.fieldVenueFilter);
  const setFieldVenueFilter = useErpUiStore((state) => state.setFieldVenueFilter);
  const deleteCourtMutation = useDeleteCourt();

  const { data: venuesData, isSuccess: venuesSuccess } = useVenues({ limit: '100' });
  const venues = useMemo(
    () => (venuesSuccess ? venuesData ?? [] : []),
    [venuesSuccess, venuesData],
  );
  const { data: fieldsData, isSuccess: fieldsSuccess, isLoading, isError, error } = useCourts({
    limit: '100',
  });
  const courts = useMemo(
    () => (fieldsSuccess ? fieldsData ?? [] : []),
    [fieldsSuccess, fieldsData],
  );
  const hasVenues = venues.length > 0;

  const handleDelete = useCallback(
    async (courtId: string) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa sân này không?')) return;
      try {
        await deleteCourtMutation.mutateAsync(courtId);
        toast.success('Xóa sân thành công');
      } catch (err) {
        showApiErrorToast(err, 'Không xóa được sân');
      }
    },
    [deleteCourtMutation],
  );

  const venueFiltered = useMemo(() => {
    if (!fieldVenueFilter) return courts;
    return courts.filter(
      (court) => court.venueId === fieldVenueFilter || court.venue?.id === fieldVenueFilter,
    );
  }, [courts, fieldVenueFilter]);

  const columns = useMemo<DataTableColumn<ICourt>[]>(
    () => [
      {
        id: 'name',
        header: 'Sân',
        sortable: true,
        sortValue: (row) => row.name,
        cell: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground">
              <LandPlotIcon className="size-4" />
            </div>
            <div className="min-w-0 max-w-60">
              <p className="truncate font-semibold text-foreground">{row.name}</p>
              {row.description ? (
                <p className="truncate text-xs text-muted-foreground">{row.description}</p>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        id: 'venue',
        header: 'Cơ sở',
        sortable: true,
        sortValue: (row) => row.venue?.name ?? '',
        cell: (row) => <span className="text-muted-foreground">{row.venue?.name || '—'}</span>,
      },
      {
        id: 'sport',
        header: 'Bộ môn',
        sortable: true,
        sortValue: (row) => row.sport?.name ?? '',
        className: 'hidden md:table-cell',
        cell: (row) => <span className="text-muted-foreground">{row.sport?.name || '—'}</span>,
      },
      {
        id: 'duration',
        header: 'Thuê tối thiểu',
        sortValue: (row) => row.minDurationMinutes,
        className: 'hidden lg:table-cell',
        cell: (row) => (
          <div className="text-muted-foreground">
            <p>{formatDurationMinutes(row.minDurationMinutes)}</p>
            <p className="text-xs">+{formatDurationMinutes(row.durationStepMinutes)}/lần</p>
          </div>
        ),
      },
      {
        id: 'price',
        header: 'Giá',
        sortable: true,
        sortValue: (row) => row.basePriceVnd,
        cell: (row) => (
          <span className="font-medium tabular-nums">
            {formatCurrency(row.basePriceVnd)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              /{formatDurationMinutes(row.minDurationMinutes)}
            </span>
          </span>
        ),
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
        id: 'actions',
        header: '',
        cell: (row) => (
          <CourtRowActions
            court={row}
            onDelete={handleDelete}
            onView={(id) => router.push(`/courts/${id}`)}
          />
        ),
      },
    ],
    [handleDelete, router],
  );

  const table = useClientDataTable({
    data: venueFiltered,
    columns,
    getRowId: (row) => row.id,
    searchPredicate: matchesSearch,
    initialPageSize: 20,
  });

  const isSearching = table.search.trim().length > 0;
  const isFilteringByVenue = Boolean(fieldVenueFilter);
  const isFiltering = isSearching || isFilteringByVenue;
  const isNotEmpty = table.allRows.length > 0;
  const isEmpty = fieldsSuccess && !isNotEmpty;
  const pageAllSelected =
    table.pageRows.length > 0 && table.pageRows.every((row) => table.selectedIds.has(row.id));

  const handleExport = () => {
    const exportColumns = table.allColumns.filter(
      (column) => column.id !== 'actions' && !table.hiddenColumns.has(column.id),
    );
    exportRowsToCsv(table.allRows, exportColumns, 'courts.csv');
  };

  const clearFilters = () => {
    table.setSearch('');
    setFieldVenueFilter(undefined);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-7 lg:px-8">
      <PageHeader
        title="Sân"
        icon={LandPlotIcon}
        actions={
          <>
            {courts.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {table.allRows.length}
              </Badge>
            )}
            {(isNotEmpty || isFiltering) && hasVenues && (
              <CourtGate.Create>
                <DialogCreateField />
              </CourtGate.Create>
            )}
          </>
        }
      />

      {(isNotEmpty || isFiltering) && (
        <>
          <DataTableToolbar
            search={table.search}
            onSearchChange={table.setSearch}
            searchPlaceholder="Tìm sân theo tên…"
            selectedCount={table.selectedIds.size}
            onClearSelection={table.clearSelection}
            columns={table.allColumns as DataTableColumn<unknown>[]}
            hiddenColumns={table.hiddenColumns}
            onToggleColumn={table.toggleColumn}
            onExport={handleExport}
          />

          <Select
            value={fieldVenueFilter || '__all__'}
            onValueChange={(value) =>
              setFieldVenueFilter(!value || value === '__all__' ? undefined : value)
            }
            items={{
              __all__: 'Tất cả cơ sở',
              ...Object.fromEntries(venues.map((venue: IVenue) => [venue.id, venue.name])),
            }}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Lọc theo cơ sở" />
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
        </>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được danh sách sân'}
        </div>
      )}

      {isLoading && !isError && (
        <div className="overflow-hidden rounded-[22px] border border-border/80 bg-card shadow-sm">
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
        <div className="overflow-hidden rounded-[22px] border border-border/80 bg-card shadow-sm">
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
              {table.pageRows.map((court) => (
                <TableRow
                  key={court.id}
                  className="group cursor-pointer border-b border-border/40 last:border-b-0 hover:bg-muted/30"
                  onMouseEnter={() => prefetchCourt(queryClient, court.id)}
                  onClick={() => router.push(`/courts/${court.id}`)}
                >
                  <TableCell className="px-3 py-3.5" onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={table.selectedIds.has(court.id)}
                      onCheckedChange={() => table.toggleRow(court.id)}
                      aria-label={`Chọn ${court.name}`}
                    />
                  </TableCell>
                  {table.visibleColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn('px-4 py-3.5 text-sm', column.className)}
                      onClick={column.id === 'actions' ? (event) => event.stopPropagation() : undefined}
                    >
                      {column.cell(court)}
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

      {!isLoading && !isError && isEmpty && isFiltering && (
        <div className="flex flex-col items-center rounded-[22px] border border-dashed border-border/80 bg-card px-6 py-12 text-center shadow-sm">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchIcon className="size-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground">Không tìm thấy sân nào</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Thử đổi từ khoá hoặc bộ lọc cơ sở.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
            <XIcon className="size-3.5" />
            Xoá bộ lọc
          </Button>
        </div>
      )}

      {!isLoading && !isError && isEmpty && !isFiltering && (
        <FieldsSetupPage hasVenues={hasVenues} />
      )}
    </div>
  );
};

function CourtRowActions({
  court,
  onDelete,
  onView,
}: {
  court: ICourt;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) {
  return (
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
        <Button
          variant="ghost"
          className="h-9 w-full justify-start gap-2 px-3 text-blue-500 hover:text-blue-600"
          onClick={() => onView(court.id)}
        >
          <EyeIcon className="size-3.5 text-blue-500" />
          Xem chi tiết
        </Button>
        <CourtGate.Edit>
          <DialogEditField courtId={court.id} />
        </CourtGate.Edit>
        <CourtGate.Delete>
          <Separator className="my-1" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 font-normal text-destructive hover:text-destructive"
            onClick={() => onDelete(court.id)}
          >
            <Trash2Icon className="size-3.5" />
            Xóa
          </Button>
        </CourtGate.Delete>
      </PopoverContent>
    </Popover>
  );
}
