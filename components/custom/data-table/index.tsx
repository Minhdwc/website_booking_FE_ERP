'use client';

import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DataTableColumn, DataTablePagination } from '@/lib/data-table/types';

type DataTableToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  selectedCount?: number;
  onClearSelection?: () => void;
  bulkActions?: React.ReactNode;
  columns: DataTableColumn<unknown>[];
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string) => void;
  onExport?: () => void;
};

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm…',
  selectedCount = 0,
  onClearSelection,
  bulkActions,
  columns,
  hiddenColumns,
  onToggleColumn,
  onExport,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <InputGroup className="h-9 w-full max-w-md rounded-xl border-border/70 bg-card shadow-sm">
        <InputGroupAddon>
          <SearchIcon className="size-3.5" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={searchPlaceholder}
          className="text-sm"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {search && (
          <InputGroupAddon align="inline-end">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Xoá tìm kiếm"
              onClick={() => onSearchChange('')}
            >
              <XIcon />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>

      <div className="flex flex-wrap items-center gap-2">
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-1.5 text-xs">
            <span className="font-medium tabular-nums">{selectedCount} đã chọn</span>
            {onClearSelection && (
              <Button variant="ghost" size="xs" onClick={onClearSelection}>
                Bỏ chọn
              </Button>
            )}
            {bulkActions}
          </div>
        )}

        {onExport && (
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={onExport}>
            <DownloadIcon className="size-3.5" />
            Export
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-8" />}>
            Cột
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={!hiddenColumns.has(column.id)}
                onCheckedChange={() => onToggleColumn(column.id)}
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

type DataTablePaginationBarProps = {
  pagination: DataTablePagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function DataTablePaginationBar({
  pagination,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationBarProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p className="tabular-nums">
        {pagination.totalItems === 0
          ? 'Không có dữ liệu'
          : `${pagination.from}–${pagination.to} / ${pagination.totalItems}`}
      </p>
      <div className="flex items-center gap-2">
        <select
          className="h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
          value={pagination.pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}/trang
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="min-w-16 text-center text-xs tabular-nums">
          {pagination.page}/{pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function DataTableSelectionHeader({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(Boolean(value))}
      aria-label="Chọn tất cả"
    />
  );
}
