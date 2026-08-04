'use client';

import { useCallback, useMemo } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MoreHorizontalIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { UsersAssignVenueDialog } from '@/components/features/users/dialog-assign-venue';
import { UsersCreateDialog } from '@/components/features/users/dialog-create';
import { UsersEditDialog } from '@/components/features/users/dialog-edit';
import { UserGate } from '@/components/auth/permission-gates';
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
import { IUser, UserRole } from '@/stores/api/types';
import { useDeleteUser, useUsers } from '@/stores/queries/user';

const roleLabel: Record<UserRole, string> = {
  admin: 'Admin',
  owner: 'Owner',
  user: 'User',
};

const matchesSearch = (user: IUser, q: string) => {
  const haystack = [user.name, user.email, user.username, user.phone, user.role]
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

export function UsersPage() {
  const { data, isSuccess, isLoading, isError, error } = useUsers({ limit: '100' });
  const deleteMutation = useDeleteUser();
  const users = isSuccess ? data : [];

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Xóa tài khoản này?')) return;
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Đã xóa tài khoản');
      } catch (err) {
        showApiErrorToast(err, 'Không xóa được tài khoản');
      }
    },
    [deleteMutation],
  );

  const columns = useMemo<DataTableColumn<IUser>[]>(
    () => [
      {
        id: 'name',
        header: 'Tên',
        sortable: true,
        sortValue: (row) => row.name,
        cell: (row) => (
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">@{row.username}</p>
          </div>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        sortable: true,
        sortValue: (row) => row.email,
        cell: (row) => <span className="text-muted-foreground">{row.email}</span>,
      },
      {
        id: 'role',
        header: 'Role',
        sortable: true,
        sortValue: (row) => row.role,
        cell: (row) => <Badge variant="secondary">{roleLabel[row.role] ?? row.role}</Badge>,
      },
      {
        id: 'status',
        header: 'Trạng thái',
        sortable: true,
        sortValue: (row) => (row.isActive ? 1 : 0),
        cell: (row) => (
          <Badge variant={row.isActive ? 'default' : 'outline'}>
            {row.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: (row) => <UserRowActions user={row} onDelete={handleDelete} />,
      },
    ],
    [handleDelete],
  );

  const table = useClientDataTable({
    data: users,
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
    exportRowsToCsv(table.allRows, exportColumns, 'users.csv');
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Tài khoản"
        description="Quản lý user/admin/owner và gán owner vào cơ sở (VenueOwner)."
        icon={UsersIcon}
        actions={
          <>
            {users.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {table.allRows.length}
              </Badge>
            )}
            <UserGate.Create>
              <UsersCreateDialog />
            </UserGate.Create>
          </>
        }
      />

      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Tìm tài khoản…"
        selectedCount={table.selectedIds.size}
        onClearSelection={table.clearSelection}
        columns={table.allColumns as DataTableColumn<unknown>[]}
        hiddenColumns={table.hiddenColumns}
        onToggleColumn={table.toggleColumn}
        onExport={handleExport}
      />

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được danh sách tài khoản'}
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
              {table.pageRows.map((user) => (
                <TableRow key={user.id} className="group hover:bg-foreground/3">
                  <TableCell className="px-3 py-3.5">
                    <Checkbox
                      checked={table.selectedIds.has(user.id)}
                      onCheckedChange={() => table.toggleRow(user.id)}
                      aria-label={`Chọn ${user.name}`}
                    />
                  </TableCell>
                  {table.visibleColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn('px-4 py-3.5 text-sm', column.className)}
                    >
                      {column.cell(user)}
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
        <div className="flex flex-col items-center gap-4">
          <EmptyState
            icon={isSearching ? SearchIcon : UsersIcon}
            title={isSearching ? 'Không tìm thấy tài khoản' : 'Chưa có tài khoản'}
            description={
              isSearching
                ? `Không có kết quả khớp với “${table.search}”.`
                : 'Tạo tài khoản đầu tiên để bắt đầu.'
            }
            action={
              isSearching
                ? { label: 'Xóa tìm kiếm', onClick: () => table.setSearch('') }
                : undefined
            }
          />
          {!isSearching && (
            <UserGate.Create>
              <UsersCreateDialog />
            </UserGate.Create>
          )}
        </div>
      )}
    </div>
  );
}

function UserRowActions({ user, onDelete }: { user: IUser; onDelete: (id: string) => void }) {
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
      <PopoverContent align="end" className="w-44 gap-0 p-1">
        <UserGate.Edit>
          <UsersEditDialog user={user} />
          {(user.role === 'owner' || user.role === 'admin') && (
            <UsersAssignVenueDialog user={user} />
          )}
        </UserGate.Edit>
        <UserGate.Delete>
          <Separator className="my-1" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 font-normal text-destructive hover:text-destructive"
            onClick={() => onDelete(user.id)}
          >
            <Trash2Icon className="size-3.5" />
            Xóa
          </Button>
        </UserGate.Delete>
      </PopoverContent>
    </Popover>
  );
}
