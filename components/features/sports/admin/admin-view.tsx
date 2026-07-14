'use client';

import { useMemo, useState } from 'react';
import { DumbbellIcon, MoreHorizontalIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import { SportsCreateDialog } from '@/components/features/sports/admin/dialog-create';
import { SportsEditDialog } from '@/components/features/sports/admin/dialog-edit';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
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
import type { ISport } from '@/stores/api/types';
import { useDeleteSport, useSports } from '@/stores/queries/sport.query';

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString('vi-VN');
  } catch {
    return value;
  }
};

export const AdminSportsView = () => {
  const [search, setSearch] = useState('');
  const { data: sports = [], isLoading, isError, error } = useSports();
  const deleteSportMutation = useDeleteSport();

  const filteredSports = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return sports;
    return sports.filter((sport: ISport) => sport.name.toLowerCase().includes(keyword));
  }, [sports, search]);

  const handleDelete = async (sport: ISport) => {
    if (!window.confirm(`Xóa bộ môn "${sport.name}"?`)) return;

    try {
      await deleteSportMutation.mutateAsync(sport.id);
      toast.success('Xóa bộ môn thành công');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Không xóa được bộ môn');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-heading">Bộ môn</h1>
            {sports.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {sports.length}
              </Badge>
            )}
          </div>
        </div>
        <SportsCreateDialog />
      </header>

      <InputGroup className="max-w-sm bg-surface">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Tìm bộ môn…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search.trim() && (
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
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error instanceof Error ? error.message : 'Không tải được danh sách bộ môn'}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3 rounded-xl border border-border/60 bg-surface p-4">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !isError && filteredSports.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-4 py-3 text-xs">Tên bộ môn</TableHead>
                <TableHead className="px-4 py-3 text-xs">Ngày tạo</TableHead>
                <TableHead className="px-4 py-3 text-xs w-14 text-right">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSports.map((sport: ISport) => (
                <TableRow key={sport.id} className="border-b border-border/40 last:border-b-0">
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground">
                        <DumbbellIcon className="size-4" />
                      </div>
                      <span className="font-semibold text-heading">{sport.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                    {formatDate(sport.createdAt)}
                  </TableCell>
                  <TableCell className="px-3 py-3.5 text-right">
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Mở thao tác"
                            className="text-muted-foreground"
                          />
                        }
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-44 gap-0 p-1">
                        <SportsEditDialog sport={sport} />
                        <Button
                          variant="ghost"
                          className="h-9 w-full justify-start rounded-lg px-3 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(sport)}
                        >
                          <Trash2Icon className="size-3.5 text-red-500" />
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

      {!isLoading && !isError && filteredSports.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <DumbbellIcon className="size-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-heading">Chưa có bộ môn</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {search.trim()
              ? `Không có bộ môn khớp với “${search}”.`
              : 'Thêm bộ môn đầu tiên để staff có thể đăng ký cho sân.'}
          </p>
        </div>
      )}
    </div>
  );
};
