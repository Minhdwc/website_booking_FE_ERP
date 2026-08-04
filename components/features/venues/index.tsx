'use client';

import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Building2Icon,
  ClockIcon,
  EyeIcon,
  LandmarkIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { VenuesCreateDialog } from '@/components/features/venues/dialog-create';
import { DialogEditVenue } from '@/components/features/venues/dialog-edit';
import { VenuesSetupPage } from '@/components/features/venues/setup-page';
import { VenueGate } from '@/components/auth/permission-gates';
import {
  DataTablePaginationBar,
  DataTableSelectionHeader,
  DataTableToolbar,
} from '@/components/custom/data-table';
import { ErrorState } from '@/components/custom/error-state';
import { PageHeader } from '@/components/custom/page-header';
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
import { formatTimeRange } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useVenuesOnboarding } from '@/hooks/use-venues-onboarding';
import { IVenue } from '@/stores/api/types';
import { prefetchVenue, useDeleteVenue, useVenues } from '@/stores/queries/venue';

const matchesSearch = (venue: IVenue, q: string) => {
  const haystack = [venue.name, venue.description, venue.address]
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

export const VenuesPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const deleteVenueMutation = useDeleteVenue();

  const {
    data: venuesData,
    isSuccess,
    isError,
    error,
    refetch,
    isLoading,
  } = useVenues({ limit: '100' });
  const venues = isSuccess ? (venuesData ?? []) : [];

  const handleDeleteVenue = useCallback(
    async (venueId: string) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa cơ sở này không?')) return;
      try {
        await deleteVenueMutation.mutateAsync(venueId);
        toast.success('Xóa cơ sở thành công');
      } catch (err) {
        showApiErrorToast(err, 'Không xóa được cơ sở');
      }
    },
    [deleteVenueMutation],
  );

  const columns = useMemo<DataTableColumn<IVenue>[]>(
    () => [
      {
        id: 'name',
        header: 'Cơ sở',
        sortable: true,
        sortValue: (row) => row.name,
        cell: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground transition-colors group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-600">
              <Building2Icon className="size-4" />
            </div>
            <div className="min-w-0 max-w-60">
              <p className="truncate font-semibold text-heading">{row.name}</p>
              {row.description ? (
                <p className="truncate text-xs text-muted-foreground">{row.description}</p>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        id: 'address',
        header: 'Địa chỉ',
        sortable: true,
        sortValue: (row) => row.address ?? '',
        cell: (row) => (
          <div
            className="flex max-w-60 items-start gap-1.5 text-muted-foreground"
            title={row.address}
          >
            <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
            <span className="line-clamp-2 text-sm">{row.address || '—'}</span>
          </div>
        ),
      },
      {
        id: 'hours',
        header: 'Giờ hoạt động',
        sortValue: (row) => row.operatingHours?.[0]?.openTime ?? '',
        cell: (row) => {
          const operatingHour = row.operatingHours?.[0];
          return operatingHour ? (
            <Badge variant="outline" className="gap-1.5 font-normal tabular-nums">
              <ClockIcon className="size-3 text-muted-foreground" />
              {formatTimeRange(operatingHour.openTime, operatingHour.closeTime)}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground/60">—</span>
          );
        },
      },
      {
        id: 'break',
        header: 'Giờ nghỉ',
        className: 'hidden md:table-cell',
        defaultVisible: false,
        cell: () => <span className="text-sm text-muted-foreground/60">—</span>,
      },
      {
        id: 'actions',
        header: '',
        cell: (row) => (
          <VenueRowActions
            venue={row}
            onDelete={handleDeleteVenue}
            onView={(id) => router.push(`/venues/${id}`)}
          />
        ),
      },
    ],
    [handleDeleteVenue, router],
  );

  const table = useClientDataTable({
    data: venues,
    columns,
    getRowId: (row) => row.id,
    searchPredicate: matchesSearch,
    initialPageSize: 20,
  });

  const isSearching = table.search.trim().length > 0;
  const isNotEmpty = table.allRows.length > 0;
  const isEmpty = isSuccess && !isNotEmpty;
  const pageAllSelected =
    table.pageRows.length > 0 && table.pageRows.every((row) => table.selectedIds.has(row.id));
  const { startTour } = useVenuesOnboarding({ enabled: isEmpty && !isSearching });

  const handleExport = () => {
    const exportColumns = table.allColumns.filter(
      (column) => column.id !== 'actions' && !table.hiddenColumns.has(column.id),
    );
    exportRowsToCsv(table.allRows, exportColumns, 'venues.csv');
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Cơ sở"
        icon={LandmarkIcon}
        actions={
          <>
            {venues.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {table.allRows.length}
              </Badge>
            )}
            <VenueGate.Create>
              {(isNotEmpty || isSearching) && <VenuesCreateDialog />}
            </VenueGate.Create>
          </>
        }
      />

      {(isNotEmpty || isSearching) && (
        <DataTableToolbar
          search={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Tìm cơ sở…"
          selectedCount={table.selectedIds.size}
          onClearSelection={table.clearSelection}
          columns={table.allColumns as DataTableColumn<unknown>[]}
          hiddenColumns={table.hiddenColumns}
          onToggleColumn={table.toggleColumn}
          onExport={handleExport}
        />
      )}

      {isError && (
        <ErrorState
          title="Không tải được danh sách"
          description={error instanceof Error ? error.message : 'Không tải được danh sách cơ sở'}
          onRetry={() => refetch()}
        />
      )}

      {isLoading && !isError && (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
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
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
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
              {table.pageRows.map((venue) => (
                <TableRow
                  key={venue.id}
                  className="group cursor-pointer border-b border-border/40 last:border-b-0 transition-colors hover:bg-muted/40"
                  onMouseEnter={() => prefetchVenue(queryClient, venue.id)}
                  onClick={() => router.push(`/venues/${venue.id}`)}
                >
                  <TableCell className="px-3 py-3.5" onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={table.selectedIds.has(venue.id)}
                      onCheckedChange={() => table.toggleRow(venue.id)}
                      aria-label={`Chọn ${venue.name}`}
                    />
                  </TableCell>
                  {table.visibleColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn('px-4 py-3.5 text-sm', column.className)}
                      onClick={
                        column.id === 'actions' ? (event) => event.stopPropagation() : undefined
                      }
                    >
                      {column.cell(venue)}
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

      {isEmpty && (
        <VenuesSetupPage
          onReplayTour={startTour}
          searchQuery={isSearching ? table.search : undefined}
          onClearSearch={isSearching ? () => table.setSearch('') : undefined}
        />
      )}
    </div>
  );
};

function VenueRowActions({
  venue,
  onDelete,
  onView,
}: {
  venue: IVenue;
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
          className="h-9 justify-start rounded-lg px-3 text-foreground hover:text-foreground"
          onClick={() => onView(venue.id)}
        >
          <EyeIcon className="mr-2 size-3.5 text-brand-600" />
          Xem chi tiết
        </Button>
        <VenueGate.Edit>
          <DialogEditVenue venueId={venue.id} />
        </VenueGate.Edit>
        <VenueGate.Delete>
          <Button
            variant="ghost"
            className="h-9 justify-start rounded-lg px-3 text-destructive hover:text-destructive"
            onClick={() => onDelete(venue.id)}
          >
            <Trash2 className="mr-2 size-3.5" />
            Xóa
          </Button>
        </VenueGate.Delete>
      </PopoverContent>
    </Popover>
  );
}
