'use client';

import { useMemo, useState } from 'react';
import { DumbbellIcon, MoreHorizontalIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import { SportsCreateDialog } from '@/components/features/sports/admin/dialog-create';
import { SportsEditDialog } from '@/components/features/sports/admin/dialog-edit';
import { EmptyState } from '@/components/custom/empty-state';
import { ErrorState } from '@/components/custom/error-state';
import { PageHeader } from '@/components/custom/page-header';
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
import { ISport } from '@/stores/api/types';
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
  const { data: sports = [], isLoading, isError, error, refetch } = useSports();
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
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Bộ môn"
        description="Quản lý danh sách bộ môn thể thão có trong hệ thống"
        icon={DumbbellIcon}
        actions={
          <>
            {sports.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {sports.length}
              </Badge>
            )}
            <SportsCreateDialog />
          </>
        }
      />

      <InputGroup className="h-9 w-full max-w-sm rounded-lg border-border/70 bg-card shadow-sm">
        <InputGroupAddon>
          <SearchIcon className="size-3.5" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Tìm bộ môn…"
          className="text-sm"
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
        <ErrorState
          title="Không tải được danh sách"
          description={error instanceof Error ? error.message : 'Không tải được danh sách bộ môn'}
          onRetry={() => refetch()}
        />
      )}

      {isLoading && (
        <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !isError && filteredSports.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
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
                <TableRow
                  key={sport.id}
                  className="border-b border-border/40 last:border-b-0 transition-colors hover:bg-muted/40"
                >
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600">
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
                          className="h-9 w-full justify-start rounded-lg px-3 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(sport)}
                        >
                          <Trash2Icon className="mr-2 size-3.5" />
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
        <EmptyState
          icon={DumbbellIcon}
          title={search.trim() ? 'Không tìm thấy bộ môn' : 'Chưa có bộ môn'}
          description={
            search.trim()
              ? `Không có bộ môn khớp với "${search}".`
              : 'Thêm bộ môn đầu tiên để staff có thể đăng ký cho sân.'
          }
        />
      )}
    </div>
  );
};
