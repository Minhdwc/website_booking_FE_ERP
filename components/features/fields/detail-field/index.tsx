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

import { showApiErrorToast } from '@/lib/api/handle-api-error';
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
import { BookingStatus, CourtStatus } from '@/stores/api/types';
import { useBookings } from '@/stores/queries/booking';
import { useDeleteCourt, useCourt } from '@/stores/queries/court';

const formatDurationMinutes = (minutes: number) => {
  if (!minutes || minutes < 0) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return hours === 1 ? '1 giờ' : `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
};

const statusLabel: Record<CourtStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Ngưng',
  maintenance: 'Bảo trì',
};

const statusVariant: Record<CourtStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  inactive: 'outline',
  maintenance: 'secondary',
};

const bookingStatusLabel: Record<BookingStatus, string> = {
  waiting_payment: 'Chờ thanh toán',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã huỷ',
  completed: 'Hoàn thành',
  expired: 'Hết hạn',
  paid_at_venue: 'Thanh toán tại quầy',
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
  paid_at_venue: 'default',
};

function formatSlotTime(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

type FieldDetailPageProps = {
  courtId: string;
};

export const FieldDetailPage = ({ courtId }: FieldDetailPageProps) => {
  const router = useRouter();
  const deleteCourtMutation = useDeleteCourt();

  const { data: court, isLoading, isError, error } = useCourt(courtId);
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings({ limit: '100' });

  const courtBookings = bookings.filter((booking) =>
    booking.items?.some((item) => item.courtId === courtId),
  );
  const images = court?.courtImages ?? [];

  const handleDelete = async () => {
    if (!court) return;
    if (!window.confirm(`Xóa sân “${court.name}”? Thao tác không thể hoàn tác.`)) return;

    try {
      await deleteCourtMutation.mutateAsync(court.id);
      toast.success('Đã xóa sân');
      router.replace('/courts');
    } catch (err: any) {
      showApiErrorToast(err, 'Không xóa được sân');
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

  if (isError || !court) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-7 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-2"
          nativeButton={false}
          render={<Link href="/courts" />}
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
            <BreadcrumbLink render={<Link href="/courts" />}>Sân</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-60 truncate">{court.name}</BreadcrumbPage>
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
              {court.name}
            </h1>
            <Badge variant={statusVariant[court.status]}>{statusLabel[court.status]}</Badge>
          </div>
          {court.description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{court.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground/70">Chưa có mô tả.</p>
          )}
          <p className="text-xs text-muted-foreground">
            Cập nhật {formatRelativeTime(court.updatedAt)} · tạo {formatDate(court.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DialogEditField courtId={court.id} triggerVariant="toolbar" />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            disabled={deleteCourtMutation.isPending}
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
                {court.venue ? (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto px-0 text-sm font-medium text-heading"
                    nativeButton={false}
                    render={<Link href={`/venues/${court.venueId}`} />}
                  >
                    {court.venue.name}
                  </Button>
                ) : (
                  <p className="mt-0.5 text-sm text-heading">—</p>
                )}
                {court.venue?.address ? (
                  <p className="flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPinIcon className="mt-0.5 size-3 shrink-0" />
                    <span>{court.venue.address}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <TrophyIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Bộ môn</p>
                <p className="mt-0.5 text-sm font-medium text-heading">
                  {court.sport?.name ?? '—'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ClockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Thời gian thuê</p>
                <p className="mt-0.5 text-sm font-medium text-heading">
                  Tối thiểu {formatDurationMinutes(court.minDurationMinutes)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Bước tăng {formatDurationMinutes(court.durationStepMinutes)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="rounded-lg bg-muted/40 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Giá thuê</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-heading">
              {formatCurrency(court.basePriceVnd)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                /{formatDurationMinutes(court.minDurationMinutes)}
              </span>
            </p>
          </div>
        </section>

        <section className="rounded-[22px] border border-border/80 bg-card p-5 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-heading">Booking gần đây</h2>
              {courtBookings.length > 0 && (
                <Badge variant="secondary" className="font-semibold tabular-nums">
                  {courtBookings.length}
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
          ) : courtBookings.length === 0 ? (
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
                  {courtBookings.slice(0, 8).map((booking) => {
                    const item =
                      booking.items?.find((entry) => entry.courtId === courtId) ??
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
        <FieldImagesSection courtId={court.id} images={images} />
      </div>
    </div>
  );
};
