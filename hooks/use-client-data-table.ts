'use client';

import { useMemo, useState } from 'react';

import type { DataTableColumn, DataTablePagination, SortDirection } from '@/lib/data-table/types';

type UseClientDataTableOptions<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  initialPageSize?: number;
  searchPredicate?: (row: T, query: string) => boolean;
};

export function useClientDataTable<T>({
  data,
  columns,
  getRowId,
  initialPageSize = 10,
  searchPredicate,
}: UseClientDataTableOptions<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
    const hidden = new Set<string>();
    for (const column of columns) {
      if (column.defaultVisible === false) hidden.add(column.id);
    }
    return hidden;
  });

  const filtered = useMemo(() => {
    if (!search.trim() || !searchPredicate) return data;
    return data.filter((row) => searchPredicate(row, search.trim()));
  }, [data, search, searchPredicate]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    const column = columns.find((item) => item.id === sortBy);
    if (!column?.sortValue) return filtered;

    const direction = sortDirection === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = column.sortValue!(a);
      const right = column.sortValue!(b);
      if (left == null && right == null) return 0;
      if (left == null) return 1;
      if (right == null) return -1;
      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * direction;
      }
      return String(left).localeCompare(String(right), 'vi') * direction;
    });
  }, [columns, filtered, sortBy, sortDirection]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [pageSize, safePage, sorted]);

  const pagination: DataTablePagination = {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    from: totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1,
    to: Math.min(safePage * pageSize, totalItems),
  };

  const visibleColumns = columns.filter((column) => !hiddenColumns.has(column.id));

  const toggleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(columnId);
    setSortDirection('asc');
  };

  const toggleColumn = (columnId: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) next.delete(columnId);
      else next.add(columnId);
      return next;
    });
  };

  const toggleRow = (rowId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const toggleAllPageRows = () => {
    const pageIds = pageRows.map(getRowId);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of pageIds) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  return {
    search,
    setSearch,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    sortBy,
    sortDirection,
    toggleSort,
    selectedIds,
    toggleRow,
    toggleAllPageRows,
    clearSelection,
    hiddenColumns,
    toggleColumn,
    visibleColumns,
    pageRows,
    allRows: sorted,
    pagination,
    allColumns: columns,
  };
}

export function exportRowsToCsv<T>(rows: T[], columns: DataTableColumn<T>[], filename: string) {
  const headers = columns.map((column) => column.header);
  const lines = rows.map((row) =>
    columns
      .map((column) => {
        const value = column.sortValue?.(row);
        const text = value == null ? '' : String(value);
        return `"${text.replace(/"/g, '""')}"`;
      })
      .join(','),
  );

  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
