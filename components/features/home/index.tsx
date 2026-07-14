'use client';

import Link from 'next/link';
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  ChartColumnIcon,
  LandmarkIcon,
  MapPinnedIcon,
  ReceiptIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePendingBookings } from '@/stores/queries/booking.query';
import { formatDate, formatLongDate, formatRelativeTime } from '@/lib/format';
import { useSession } from '@/provider/session-provider';

const shortcuts = [
  { title: 'Đặt sân', href: '/bookings', icon: CalendarDaysIcon },
  { title: 'Sân', href: '/fields', icon: MapPinnedIcon },
  { title: 'Cơ sở', href: '/venues', icon: LandmarkIcon },
  { title: 'Thanh toán', href: '/payments', icon: ReceiptIcon },
];

export const Home = () => {
  const { user } = useSession();
  const { pendingBookings, pendingCount, isLoading } = usePendingBookings();
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 md:p-6 lg:p-8">
      <section
        className={`relative overflow-hidden rounded-2xl bg-brand-primary-500 px-6 py-8 text-white md:px-8 md:py-10`}
      >
        <div
          className={`pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-brand-secondary-400/25`}
        />
        <div
          className={`pointer-events-none absolute -bottom-20 left-1/4 size-48 rounded-full bg-brand-accent-500/20`}
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-white/70">{formatLongDate()}</p>
            <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Chào {user?.name}</h1>
          </div>

          <Button
            size="sm"
            className={`rounded-lg border-0 bg-brand-secondary-500 text-white hover:border-brand-secondary-400`}
            nativeButton={false}
            render={<Link href="/bookings" />}
          >
            Xem lịch
            <ArrowRightIcon className="size-3.5" />
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-heading">Phím tắt nhanh</h2>
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
              className={`rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand-secondary-400`}
            >
              <item.icon className="size-5 text-brand-primary-500" />
              <p className="mt-3 text-sm font-semibold text-heading">{item.title}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-heading">Cần xử lý</h2>
          {pendingCount > 0 ? (
            <span className="text-xs font-medium text-brand-secondary-600">
              {pendingCount} chờ xác nhận
            </span>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-surface">
          {isLoading ? (
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="ml-auto h-4 w-20" />
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CalendarDaysIcon className="mx-auto size-5 text-brand-secondary-500" />
              <p className="mt-3 text-sm font-semibold text-heading">Chưa có lịch đặt sân</p>
            </div>
          ) : (
            pendingBookings.map((booking) => (
              <Link
                key={booking.id}
                href="/bookings"
                className={`flex items-center gap-3 border-b border-border px-5 py-4 last:border-0 hover:border-brand-secondary-400`}
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
