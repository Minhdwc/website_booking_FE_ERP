'use client';

import { useMemo, useState } from 'react';
import { MoreHorizontalIcon, SearchIcon, Trash2Icon, UsersIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import { UsersAssignVenueDialog } from '@/components/features/users/dialog-assign-venue';
import { UsersCreateDialog } from '@/components/features/users/dialog-create';
import { UsersEditDialog } from '@/components/features/users/dialog-edit';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
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
import { IUser, UserRole } from '@/stores/api/types';
import { useDeleteUser, useUsers } from '@/stores/queries/user.query';

const roleLabel: Record<UserRole, string> = {
  admin: 'Admin',
  staff: 'Staff',
  user: 'User',
};

const matchesSearch = (user: IUser, q: string) => {
  const haystack = [user.name, user.email, user.username, user.phone, user.role]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
};

export function UsersPage() {
  const [search, setSearch] = useState('');
  const { data, isSuccess, isLoading, isError, error } = useUsers({ limit: '100' });
  const deleteMutation = useDeleteUser();

  const filtered = useMemo(() => {
    const users = isSuccess ? data : [];
    return search.trim() ? users.filter((user) => matchesSearch(user, search.trim())) : users;
  }, [isSuccess, data, search]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa tài khoản này?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Đã xóa tài khoản');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không xóa được tài khoản');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-heading">Tài khoản</h1>
            {filtered.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {filtered.length}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Quản lý user/admin/staff và gán staff vào cơ sở (VenueOwner).
          </p>
        </div>
        <UsersCreateDialog />
      </header>

      <InputGroup className="h-9 w-full max-w-[220px] rounded-xl border-border/70 bg-card shadow-sm">
        <InputGroupAddon>
          <SearchIcon className="size-3.5" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Tìm tài khoản…"
          className="text-sm"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {Boolean(search.trim()) && (
          <InputGroupAddon align="inline-end">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Xoá tìm kiếm"
              onClick={() => setSearch('')}
            >
              <XIcon />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>

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

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-card hover:bg-transparent">
                <TableHead className="px-4 text-xs">Tên</TableHead>
                <TableHead className="px-4 text-xs">Email</TableHead>
                <TableHead className="px-4 text-xs">Role</TableHead>
                <TableHead className="px-4 text-xs">Trạng thái</TableHead>
                <TableHead className="w-14 px-4 text-right text-xs">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} className="group hover:bg-foreground/3">
                  <TableCell className="px-4 py-3.5">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Badge variant="secondary">{roleLabel[user.role] ?? user.role}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Badge variant={user.isActive ? 'default' : 'outline'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3.5 text-right">
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
                        <UsersEditDialog user={user} />
                        {(user.role === 'staff' || user.role === 'admin') && (
                          <UsersAssignVenueDialog user={user} />
                        )}
                        <Separator className="my-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 font-normal text-destructive hover:text-destructive"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2Icon className="size-3.5" />
                          Xóa
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border border-dashed bg-card px-6 py-12 text-center">
          <UsersIcon className="size-5 text-muted-foreground" />
          <h2 className="mt-4 text-base font-semibold text-heading">Chưa có tài khoản</h2>
          <div className="mt-4">
            <UsersCreateDialog />
          </div>
        </div>
      )}
    </div>
  );
}
