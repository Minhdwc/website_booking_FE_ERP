'use client';

import { Clock3Icon, MoreHorizontalIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { TimeslotsCreateDialog } from '@/components/features/timeslots/dialog-create';
import { TimeslotsEditDialog } from '@/components/features/timeslots/dialog-edit';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { ITimeslot } from '@/stores/api/types';
import { useDeleteTimeslot, useTimeslots } from '@/stores/queries/timeslot.query';

function formatSlotTime(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

export function TimeslotsPage() {
  const { data, isSuccess, isLoading, isError, error } = useTimeslots();
  const timeslots = isSuccess ? data : [];
  const deleteMutation = useDeleteTimeslot();

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa khung giờ này?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Đã xóa khung giờ');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không xóa được khung giờ');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-heading">Khung giờ</h1>
            {timeslots.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {timeslots.length}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Quản lý các khung giờ dùng cho đặt sân trên hệ thống.
          </p>
        </div>
        <TimeslotsCreateDialog />
      </header>

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được danh sách khung giờ'}
        </div>
      )}

      {isLoading && !isError && (
        <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !isError && timeslots.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-card hover:bg-transparent">
                <TableHead className="px-4 py-3 text-xs">Giờ bắt đầu</TableHead>
                <TableHead className="px-4 py-3 text-xs">Giờ kết thúc</TableHead>
                <TableHead className="w-14 px-4 py-3 text-right text-xs">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeslots.map((slot: ITimeslot) => (
                <TableRow
                  key={slot.id}
                  className="group border-b border-border/40 last:border-b-0 hover:bg-foreground/3"
                >
                  <TableCell className="px-4 py-3.5 font-medium tabular-nums">
                    {formatSlotTime(slot.startTime)}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 tabular-nums text-muted-foreground">
                    {formatSlotTime(slot.endTime)}
                  </TableCell>
                  <TableCell className="px-3 py-3.5 text-right">
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Mở thao tác"
                            className="text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100"
                          />
                        }
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-40 gap-0 p-1">
                        <TimeslotsEditDialog timeslot={slot} />
                        <Separator className="my-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 font-normal text-destructive hover:text-destructive"
                          onClick={() => handleDelete(slot.id)}
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

      {!isLoading && !isError && timeslots.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Clock3Icon className="size-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-heading">Chưa có khung giờ</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Tạo khung giờ đầu tiên để khách có thể chọn khi đặt sân.
          </p>
          <div className="mt-4">
            <TimeslotsCreateDialog />
          </div>
        </div>
      )}
    </div>
  );
}
