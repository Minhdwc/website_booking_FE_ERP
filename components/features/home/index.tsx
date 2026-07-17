'use client';

import Link from 'next/link';
import {
  CalendarDaysIcon,
  ChartColumnIcon,
  LandmarkIcon,
  MapPinnedIcon,
  WalletCardsIcon,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { usePendingBookings } from '@/stores/queries/booking.query';
import { useReportSummary } from '@/stores/queries/report.query';
import { formatDate, formatLongDate, formatRelativeTime } from '@/lib/format';

const shortcuts = [
  { title: 'Đặt sân', href: '/bookings', icon: CalendarDaysIcon },
  { title: 'Sân', href: '/fields', icon: MapPinnedIcon },
  { title: 'Cơ sở', href: '/venues', icon: LandmarkIcon },
  { title: 'Thanh toán', href: '/payment-method', icon: WalletCardsIcon },
];

export const Home = () => {
  const { pendingBookings, pendingCount, isLoading } = usePendingBookings();
  const { data: reportSummary, isLoading: isReportLoading } = useReportSummary();

  const revenueTotal = reportSummary?.revenue.total ?? 0;
  const totalBookings =
    reportSummary?.bookingsByStatus.reduce((sum, row) => sum + row.count, 0) ?? 0;

  // API summary hiện chưa cung cấp count "sân đang hoạt động"
  const activeFields = 0;

  const weekDeltaPercent = 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-7 px-6 py-7 lg:px-8">
      <section>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{formatLongDate()}</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-heading sm:text-5xl">
            Trang chủ
          </h1>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-heading">Tổng Doanh Thu</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-heading">
                {isReportLoading ? 0 : revenueTotal.toLocaleString('vi-VN')} VNĐ
              </p>
              <p className="mt-1 text-sm text-brand-secondary-600">
                +{weekDeltaPercent}% so với tuần trước
              </p>
            </div>
            <WalletCardsIcon className="size-12 text-brand-secondary-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-heading">Tổng Số Lượt Đặt</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-heading">
                {isReportLoading ? 0 : totalBookings}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Hôm nay: 0</p>
            </div>
            <CalendarDaysIcon className="size-12 text-brand-secondary-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-heading">Sân Đang Hoạt Động</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-heading">
                {activeFields}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">0</p>
            </div>
            <MapPinnedIcon className="size-12 text-brand-secondary-600" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-heading">Lịch đặt sân gần đây</h2>
          <Link
            href="/reports"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            <ChartColumnIcon className="size-3.5" />
            Báo cáo
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <item.icon className="size-5 text-brand-secondary-600" />
              <p className="mt-3 text-sm font-semibold text-heading">{item.title}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="border-b border-border/70 px-5 py-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-heading">Lịch đặt sân gần đây</h2>
            {pendingCount > 0 ? (
              <span className="text-xs font-medium text-brand-secondary-600">
                {pendingCount} chờ xác nhận
              </span>
            ) : null}
          </div>
        </div>

        <div className="bg-card">
          {isLoading ? (
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="ml-auto h-4 w-20" />
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CalendarDaysIcon className="mx-auto size-5 text-brand-secondary-600" />
              <p className="mt-3 text-sm font-semibold text-heading">Chưa có lịch đặt sân</p>
            </div>
          ) : (
            pendingBookings.map((booking) => (
              <Link
                key={booking.id}
                href="/bookings"
                className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0 hover:bg-muted/35"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-heading">
                    {booking.field?.name}
                    {booking.field?.venue?.name ? (
                      <span className="font-normal text-muted-foreground">
                        {' '}
                        · {booking.field.venue.name}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {booking.user?.name} · {formatDate(booking.date)}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(booking.createdAt)}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
