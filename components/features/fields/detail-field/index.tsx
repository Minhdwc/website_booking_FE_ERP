'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  Building2Icon,
  CalendarDaysIcon,
  ClockIcon,
  LandPlotIcon,
  MapPinIcon,
  Trash2Icon,
  TrophyIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { DialogEditField } from '@/components/features/fields/dialog-edit-field';
import { FieldImagesSection } from '@/components/features/fields/detail-field/images-section';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
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
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/format';
import { BookingStatus, FieldStatus } from '@/stores/api/types';
import { useBookings } from '@/stores/queries/booking.query';
import { useDeleteField, useField } from '@/stores/queries/field.query';

const formatDurationMinutes = (minutes: number) => {
  if (!minutes || minutes < 0) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return hours === 1 ? '1 giờ' : `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
};

const statusLabel: Record<FieldStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Ngưng',
};

const statusVariant: Record<FieldStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  inactive: 'outline',
};

const bookingStatusLabel: Record<BookingStatus, string> = {
  waiting_payment: 'Chờ thanh toán',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã huỷ',
  completed: 'Hoàn thành',
  expired: 'Hết hạn',
};

const bookingStatusVariant: Record<
  BookingStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  waiting_payment: 'secondary',
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'outline',
  expired: 'outline',
};

function formatSlotTime(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

type FieldDetailPageProps = {
  fieldId: string;
};

export const FieldDetailPage = ({ fieldId }: FieldDetailPageProps) => {
  const router = useRouter();
  const deleteFieldMutation = useDeleteField();

  const { data: field, isLoading, isError, error } = useField(fieldId);
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings({ limit: '100' });

  const fieldBookings = bookings.filter((booking) =>
    booking.items?.some((item) => item.fieldId === fieldId),
  );
  const images = field?.fieldImages ?? [];

  const handleDelete = async () => {
    if (!field) return;
    if (!window.confirm(`Xóa sân “${field.name}”? Thao tác không thể hoàn tác.`)) return;

    try {
      await deleteFieldMutation.mutateAsync(field.id);
      toast.success('Đã xóa sân');
      router.replace('/fields');
    } catch (err: any) {
      toast.error(err?.message || 'Không xóa được sân');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-7 lg:px-8">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (isError || !field) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-7 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-2"
          nativeButton={false}
          render={<Link href="/fields" />}
        >
          <ArrowLeftIcon className="size-3.5" />
          Quay lại danh sách
        </Button>
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-8 text-center text-sm text-error">
          {error instanceof Error ? error.message : 'Không tải được thông tin sân'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-7 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/fields" />}>Sân</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-60 truncate">{field.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground">
              <LandPlotIcon className="size-5" />
            </div>
            <h1 className="truncate text-2xl font-bold tracking-tight text-heading">
              {field.name}
            </h1>
            <Badge variant={statusVariant[field.status]}>{statusLabel[field.status]}</Badge>
          </div>
          {field.description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{field.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground/70">Chưa có mô tả.</p>
          )}
          <p className="text-xs text-muted-foreground">
            Cập nhật {formatRelativeTime(field.updatedAt)} · tạo {formatDate(field.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DialogEditField fieldId={field.id} triggerVariant="toolbar" />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            disabled={deleteFieldMutation.isPending}
            onClick={handleDelete}
          >
            <Trash2Icon className="size-3.5" />
            Xóa
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="space-y-4 rounded-[22px] border border-border/80 bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-heading">Thông tin sân</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <Building2Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Cơ sở</p>
                {field.venue ? (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto px-0 text-sm font-medium text-heading"
                    nativeButton={false}
                    render={<Link href={`/venues/${field.venueId}`} />}
                  >
                    {field.venue.name}
                  </Button>
                ) : (
                  <p className="mt-0.5 text-sm text-heading">—</p>
                )}
                {field.venue?.location ? (
                  <p className="flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPinIcon className="mt-0.5 size-3 shrink-0" />
                    <span>{field.venue.location}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <TrophyIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Bộ môn</p>
                <p className="mt-0.5 text-sm font-medium text-heading">
                  {field.sport?.name ?? '—'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ClockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Thời gian thuê</p>
                <p className="mt-0.5 text-sm font-medium text-heading">
                  Tối thiểu {formatDurationMinutes(field.minDurationMinutes)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Bước tăng {formatDurationMinutes(field.durationStepMinutes)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="rounded-lg bg-muted/40 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Giá thuê</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-heading">
              {formatCurrency(field.price)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                /{formatDurationMinutes(field.minDurationMinutes)}
              </span>
            </p>
          </div>
        </section>

        <section className="rounded-[22px] border border-border/80 bg-card p-5 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-heading">Booking gần đây</h2>
              {fieldBookings.length > 0 && (
                <Badge variant="secondary" className="font-semibold tabular-nums">
                  {fieldBookings.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/bookings" />}
            >
              Xem tất cả
            </Button>
          </div>

          {bookingsLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : fieldBookings.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Chưa có booking cho sân này.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/60 bg-muted/40 hover:bg-muted/40">
                    <TableHead className="px-3 py-2.5 text-xs">Ngày</TableHead>
                    <TableHead className="px-3 py-2.5 text-xs">Khách</TableHead>
                    <TableHead className="px-3 py-2.5 text-xs">Khung giờ</TableHead>
                    <TableHead className="px-3 py-2.5 text-xs">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fieldBookings.slice(0, 8).map((booking) => {
                    const item =
                      booking.items?.find((entry) => entry.fieldId === fieldId) ??
                      booking.items?.[0];
                    return (
                      <TableRow
                        key={booking.id}
                        className="border-b border-border/40 last:border-b-0"
                      >
                        <TableCell className="px-3 py-2.5 text-sm tabular-nums">
                          {item ? formatDate(item.date) : '—'}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-sm">
                          {booking.user?.name ?? '—'}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-sm tabular-nums text-muted-foreground">
                          {item
                            ? `${formatSlotTime(item.startTime)} – ${formatSlotTime(item.endTime)}`
                            : '—'}
                        </TableCell>
                        <TableCell className="px-3 py-2.5">
                          <Badge variant={bookingStatusVariant[booking.status]}>
                            {bookingStatusLabel[booking.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>

      <div className="rounded-[22px] border border-border/80 bg-card p-4 shadow-sm md:p-5">
        <FieldImagesSection fieldId={field.id} images={images} />
      </div>
    </div>
  );
};
