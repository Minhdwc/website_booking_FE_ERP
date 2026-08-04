import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | boolean | null | undefined;
  className?: string;
  defaultVisible?: boolean;
};

export type DataTableState = {
  search: string;
  page: number;
  pageSize: number;
  sortBy: string | null;
  sortDirection: SortDirection;
  selectedIds: Set<string>;
  hiddenColumns: Set<string>;
};

export type DataTablePagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  from: number;
  to: number;
};
