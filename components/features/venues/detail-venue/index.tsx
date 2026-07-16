'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  Building2Icon,
  ClockIcon,
  LandPlotIcon,
  MapPinIcon,
  MoonIcon,
  Trash2Icon,
  WalletCardsIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { DialogEditVenue } from '@/components/features/venues/dialog-edit';
import { VenueImagesSection } from '@/components/features/venues/detail-venue/images-section';
import { VenueLocationMap } from '@/components/features/venues/location-map';
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
import { FieldStatus, IField } from '@/stores/api/types';
import { useErpUiStore } from '@/stores/index.store';
import { useVenuePaymentAccounts } from '@/stores/queries/venue-payment-account.query';
import { useVenueSports } from '@/stores/queries/venue-sport.query';
import { useDeleteVenue, useVenue } from '@/stores/queries/venue.query';

const statusLabel: Record<FieldStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Ngưng',
};

type VenueDetailPageProps = {
  venueId: string;
};

export const VenueDetailPage = ({ venueId }: VenueDetailPageProps) => {
  const router = useRouter();
  const setFieldVenueFilter = useErpUiStore((state) => state.setFieldVenueFilter);
  const deleteVenueMutation = useDeleteVenue();

  const { data: venue, isLoading, isError, error } = useVenue(venueId);
  const { data: venueSports = [] } = useVenueSports(
    { venueId, limit: '100' },
    { enabled: Boolean(venueId) },
  );
  const { data: paymentAccounts = [] } = useVenuePaymentAccounts(
    venueId ? { venueId, limit: '100' } : undefined,
  );

  const fields = venue?.fields ?? [];
  const images = venue?.venueImages ?? [];
  const activeSports = venueSports.filter((item) => item.isActive);
  const activePayments = paymentAccounts.filter((item) => item.isActive);

  const handleDelete = async () => {
    if (!venue) return;
    if (!window.confirm(`Xóa cơ sở “${venue.name}”? Thao tác không thể hoàn tác.`)) return;

    try {
      await deleteVenueMutation.mutateAsync(venue.id);
      toast.success('Đã xóa cơ sở');
      router.replace('/venues');
    } catch (err: any) {
      toast.error(err?.message || 'Không xóa được cơ sở');
    }
  };

  const goToFields = () => {
    setFieldVenueFilter(venueId);
    router.push('/fields');
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-7 lg:px-8">
        <Skeleton className="h-4 w-40" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <Skeleton className="h-56 rounded-xl lg:col-span-2" />
          <Skeleton className="h-56 rounded-xl lg:col-span-3" />
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (isError || !venue) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-7 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-2"
          nativeButton={false}
          render={<Link href="/venues" />}
        >
          <ArrowLeftIcon className="size-3.5" />
          Quay lại danh sách
        </Button>
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-8 text-center text-sm text-error">
          {error instanceof Error ? error.message : 'Không tải được thông tin cơ sở'}
        </div>
      </div>
    );
  }

  const restTime =
    venue.restStartTime && venue.restEndTime
      ? `${venue.restStartTime} – ${venue.restEndTime}`
      : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-7 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/venues" />}>Cơ sở</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[240px] truncate">{venue.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground">
              <Building2Icon className="size-5" />
            </div>
            <h1 className="truncate text-2xl font-bold tracking-tight text-heading">
              {venue.name}
            </h1>
          </div>
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
            <span>{venue.location}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DialogEditVenue venueId={venue.id} />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            disabled={deleteVenueMutation.isPending}
            onClick={handleDelete}
          >
            <Trash2Icon className="size-3.5" />
            Xóa
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="space-y-4 rounded-[22px] border border-border/80 bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-heading">Thông tin</h2>

          {venue.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{venue.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground/70">Chưa có mô tả.</p>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <ClockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Giờ hoạt động</p>
                <p className="mt-0.5 text-sm font-medium tabular-nums text-heading">
                  {venue.openTime} – {venue.closeTime}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MoonIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Giờ nghỉ</p>
                <p className="mt-0.5 text-sm font-medium tabular-nums text-heading">
                  {restTime ?? 'Không có'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tọa độ</p>
                <p className="mt-0.5 font-mono text-xs tabular-nums text-heading">
                  {venue.latitude.toFixed(5)}, {venue.longitude.toFixed(5)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
              <p className="text-lg font-semibold tabular-nums text-heading">{fields.length}</p>
              <p className="text-[11px] text-muted-foreground">Sân</p>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
              <p className="text-lg font-semibold tabular-nums text-heading">
                {activeSports.length}
              </p>
              <p className="text-[11px] text-muted-foreground">Bộ môn</p>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
              <p className="text-lg font-semibold tabular-nums text-heading">
                {activePayments.length}
              </p>
              <p className="text-[11px] text-muted-foreground">Phương thức thanh toán</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[22px] border border-border/80 bg-card shadow-sm lg:col-span-3">
          <div className="border-b border-border/60 px-4 py-3">
            <h2 className="text-sm font-semibold text-heading">Vị trí trên bản đồ</h2>
          </div>
          <div className="h-[280px] w-full">
            <VenueLocationMap longitude={venue.longitude} latitude={venue.latitude} />
          </div>
        </section>
      </div>

      <div className="rounded-[22px] border border-border/80 bg-card p-4 shadow-sm md:p-5">
        <VenueImagesSection venueId={venue.id} images={images} />
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-heading">Sân thuộc cơ sở</h2>
            {fields.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {fields.length}
              </Badge>
            )}
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={goToFields}>
            <LandPlotIcon className="size-3.5" />
            Quản lý sân
          </Button>
        </div>

        {fields.length === 0 ? (
          <div className="flex flex-col items-center rounded-[22px] border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center shadow-sm">
            <LandPlotIcon className="size-5 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-heading">Chưa có sân</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Tạo sân gắn với cơ sở này để bắt đầu nhận booking.
            </p>
            <Button type="button" size="sm" className="mt-4" onClick={goToFields}>
              Sang trang Sân
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[22px] border border-border/80 bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/60 bg-muted/40 hover:bg-muted/40">
                  <TableHead className="px-4 py-3 text-xs">Sân</TableHead>
                  <TableHead className="px-4 py-3 text-xs">Bộ môn</TableHead>
                  <TableHead className="px-4 py-3 text-xs">Giá</TableHead>
                  <TableHead className="px-4 py-3 text-xs">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field: IField) => (
                  <TableRow
                    key={field.id}
                    className="group cursor-pointer border-b border-border/40 last:border-b-0 hover:bg-muted/30"
                    onClick={() => router.push(`/fields/${field.id}`)}
                  >
                    <TableCell className="px-4 py-3.5">
                      <p className="font-medium text-heading">{field.name}</p>
                      {field.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {field.description}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                      {field.sport?.name ?? '—'}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-sm tabular-nums">
                      {formatCurrency(field.price)}
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      <Badge variant={field.status === 'active' ? 'default' : 'outline'}>
                        {statusLabel[field.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[22px] border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-heading">Bộ môn tại cơ sở</h2>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/sports" />}>
              Xem
            </Button>
          </div>
          {venueSports.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Chưa gắn bộ môn.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {venueSports.map((item) => (
                <Badge key={item.id} variant={item.isActive ? 'secondary' : 'outline'}>
                  {item.sport?.name ?? '—'}
                </Badge>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[22px] border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <WalletCardsIcon className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-heading">Thanh toán</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/payment-method" />}
            >
              Xem
            </Button>
          </div>
          {paymentAccounts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Chưa đăng ký phương thức nhận tiền.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {paymentAccounts.map((account) => (
                <li key={account.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-heading">
                    {account.paymentMethod?.name ?? '—'}
                  </span>
                  <Badge variant={account.isActive ? 'default' : 'outline'}>
                    {account.isActive ? 'Đang dùng' : 'Tạm dừng'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};
