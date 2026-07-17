'use client';

import { useState } from 'react';
import { DumbbellIcon, MoreHorizontalIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { DialogEditVenueSport } from '@/components/features/sports/staff/dialog-edit-venue-sport';
import { DialogRegisterVenueSport } from '@/components/features/sports/staff/staff-register';
import { ComboboxVenue } from '@/components/custom/combobox/combobox-venue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IVenueSport } from '@/stores/api/types';
import {
  useDeleteVenueSport,
  useUpdateVenueSport,
  useVenueSports,
} from '@/stores/queries/venue-sport.query';
import { useVenues } from '@/stores/queries/venue.query';

export const StaffSportsView = () => {
  const { data: venues = [], isLoading: venuesLoading } = useVenues();
  const [venueId, setVenueId] = useState('');
  const selectedVenueId = venueId || venues[0]?.id || '';
  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId);

  const {
    data: venueSportsData,
    isSuccess,
    isFetching,
    isError,
    error,
  } = useVenueSports(selectedVenueId ? { venueId: selectedVenueId } : undefined, {
    enabled: Boolean(selectedVenueId),
  });

  const venueSports = isSuccess ? (venueSportsData ?? []) : [];

  const updateMutation = useUpdateVenueSport();
  const deleteMutation = useDeleteVenueSport();

  const activeCount = venueSports.filter((item) => item.isActive).length;
  const hasVenues = venues.length > 0;
  const hasRegistrations = venueSports.length > 0;

  const handleToggleActive = async (item: IVenueSport) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        body: { isActive: !item.isActive },
      });
      toast.success(item.isActive ? 'Đã tạm dừng bộ môn' : 'Đã kích hoạt bộ môn');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Không cập nhật được trạng thái');
    }
  };

  const handleUnregister = async (item: IVenueSport) => {
    if (!window.confirm(`Hủy đăng ký bộ môn "${item.sport?.name || ''}"?`)) return;

    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Đã hủy đăng ký bộ môn');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Không hủy được đăng ký');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-heading">Bộ môn sân</h1>
          {hasRegistrations && (
            <Badge variant="secondary" className="font-semibold tabular-nums">
              {venueSports.length}
            </Badge>
          )}
        </div>
      </header>

      {!venuesLoading && !hasVenues && (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <DumbbellIcon className="size-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-heading">Chưa được gán cơ sở</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Liên hệ admin để được thêm vào VenueOwner trước khi đăng ký bộ môn.
          </p>
        </div>
      )}

      {hasVenues && (
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full max-w-xs space-y-1.5">
              <Label htmlFor="staff-sports-venue">Cơ sở</Label>
              <ComboboxVenue value={selectedVenueId} onChange={setVenueId} />
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {hasRegistrations && (
                <>
                  {activeCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="font-semibold tabular-nums bg-emerald-600 text-white py-2.5"
                    >
                      {activeCount} đang hoạt động
                    </Badge>
                  )}
                  {venueSports.length - activeCount > 0 && (
                    <Badge
                      variant="outline"
                      className="tabular-nums rounded-sm bg-red-600 p-3 text-white"
                    >
                      {venueSports.length - activeCount} tạm dừng
                    </Badge>
                  )}
                </>
              )}
              <DialogRegisterVenueSport
                venueId={selectedVenueId}
                venueName={selectedVenue?.name}
                registeredSports={venueSports}
              />
            </div>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được danh sách đăng ký'}
        </div>
      )}

      {isFetching && selectedVenueId && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="space-y-0 divide-y divide-border/40 p-4">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {isSuccess && !isFetching && selectedVenueId && hasRegistrations && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-4 py-3 text-xs">Bộ môn</TableHead>
                <TableHead className="px-4 py-3 text-xs">Mô tả</TableHead>
                <TableHead className="px-4 py-3 text-xs">Trạng thái</TableHead>
                <TableHead className="w-14 px-4 py-3 text-right text-xs">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venueSports.map((item) => (
                <TableRow key={item.id} className="group border-b border-border/40 last:border-b-0">
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground">
                        <DumbbellIcon className="size-4" />
                      </div>
                      <span className="font-semibold text-heading">{item.sport?.name || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[360px] px-4 py-3.5">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {item.description || 'Chưa có mô tả'}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {item.isActive ? (
                        <Badge
                          variant="secondary"
                          className="font-semibold tabular-nums bg-emerald-600 text-white py-2.5"
                        >
                          Đang hoạt động
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="font-semibold tabular-nums bg-red-600 text-white py-2.5"
                        >
                          Tạm dừng
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3.5 text-right">
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
                        <DialogEditVenueSport item={item} />
                        <Separator className="my-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-full justify-start gap-2 rounded-lg px-3 font-normal text-destructive hover:text-destructive"
                          onClick={() => handleUnregister(item)}
                        >
                          <Trash2Icon className="size-3.5" />
                          Hủy đăng ký
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

      {isSuccess && !isFetching && selectedVenueId && !hasRegistrations && hasVenues && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <DumbbellIcon className="size-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-heading">
            {selectedVenue?.name || 'Cơ sở'} chưa có bộ môn
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Đăng ký bộ môn từ catalog để khách có thể tìm và đặt sân theo từng loại hình.
          </p>
          <div className="mt-5">
            <DialogRegisterVenueSport
              venueId={selectedVenueId}
              venueName={selectedVenue?.name}
              registeredSports={venueSports}
            />
          </div>
        </div>
      )}
    </div>
  );
};
