'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  ChartColumnIcon,
  LandmarkIcon,
  MapPinnedIcon,
  UsersIcon,
  WalletCardsIcon,
} from 'lucide-react';

import { EmptyState } from '@/components/custom/empty-state';
import { PageHeader } from '@/components/custom/page-header';
import { StatCard } from '@/components/custom/stat-card';
import { usePendingBookings } from '@/stores/queries/booking.query';
import { useReportSummary } from '@/stores/queries/report.query';
import { useSupportTickets } from '@/stores/queries/support-ticket.query';
import { useSession } from '@/provider/session-provider';
import { formatDate, formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

const ownerShortcuts = [
  { title: 'Lịch sân', href: '/calendar', icon: CalendarDaysIcon, description: 'Tuần hiện tại' },
  { title: 'Sân', href: '/courts', icon: MapPinnedIcon, description: 'Danh sách sân' },
  { title: 'Cơ sở', href: '/venues', icon: LandmarkIcon, description: 'Quản lý cơ sở' },
  {
    title: 'Thanh toán',
    href: '/payment-method',
    icon: WalletCardsIcon,
    description: 'PT thanh toán',
  },
];

const adminShortcuts = [
  { title: 'Hỗ trợ', href: '/admin/tickets', icon: UsersIcon, description: 'Ticket hệ thống' },
  { title: 'Báo cáo', href: '/admin/reports', icon: ChartColumnIcon, description: 'Toàn hệ thống' },
  { title: 'Tài khoản', href: '/users', icon: UsersIcon, description: 'Quản lý user' },
  { title: 'Bộ môn', href: '/sports', icon: MapPinnedIcon, description: 'Danh mục bộ môn' },
];

type HomeProps = {
  variant?: 'owner' | 'admin';
};

export const Home = ({ variant = 'owner' }: HomeProps) => {
  const { user } = useSession();
  const isAdmin = variant === 'admin' || user?.role === 'admin';
  const { pendingBookings, pendingCount, isLoading } = usePendingBookings();
  const { data: reportSummary, isLoading: isReportLoading } = useReportSummary();
  const { data: openTickets = [] } = useSupportTickets({ limit: '100' }, { enabled: isAdmin });

  const openTicketCount = useMemo(
    () => openTickets.filter((ticket) => ticket.status !== 'resolved').length,
    [openTickets],
  );

  const revenueTotal = reportSummary?.revenue.total ?? 0;
  const totalBookings =
    reportSummary?.bookingsByStatus.reduce((sum, row) => sum + row.count, 0) ?? 0;

  const shortcuts = isAdmin ? adminShortcuts : ownerShortcuts;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title={isAdmin ? 'Admin Dashboard' : 'Trang chủ'}
        description={
          isAdmin
            ? 'Tổng quan ticket hỗ trợ và báo cáo hệ thống'
            : 'Tổng quan hoạt động đặt sân và doanh thu'
        }
        icon={ChartColumnIcon}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Tổng doanh thu"
          value={isReportLoading ? '0' : `${revenueTotal.toLocaleString('vi-VN')} VNĐ`}
          description={isReportLoading ? undefined : 'Theo khoảng báo cáo mặc định'}
          icon={WalletCardsIcon}
          loading={isReportLoading}
        />
        <StatCard
          title={isAdmin ? 'Tổng lượt đặt' : 'Tổng lượt đặt'}
          value={isReportLoading ? '0' : totalBookings}
          description="Theo báo cáo"
          icon={CalendarDaysIcon}
          loading={isReportLoading}
        />
        <StatCard
          title={isAdmin ? 'Ticket mở' : 'Sân đang hoạt động'}
          value={isAdmin ? openTicketCount : '—'}
          description={isAdmin ? 'Chưa resolved' : 'Xem tại Courts'}
          icon={isAdmin ? UsersIcon : MapPinnedIcon}
        />
      </section>

      <section className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-heading">Lối tắt nhanh</h2>
          <Link
            href={isAdmin ? '/admin/reports' : '/reports'}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-brand-600 hover:underline"
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
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border/70 bg-card p-4',
                'transition-all duration-200 ease-out',
                'hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm',
              )}
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100 group-hover:text-brand-700">
                <item.icon className="size-4" />
              </div>
              <p className="mt-3 text-sm font-semibold text-heading">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {isAdmin ? (
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/70 px-5 py-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-heading">Hàng đợi hỗ trợ</h2>
              <Link
                href="/admin/tickets"
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="bg-card">
            {openTickets.filter((ticket) => ticket.status !== 'resolved').length === 0 ? (
              <EmptyState
                icon={UsersIcon}
                title="Không có ticket mở"
                description="Các yêu cầu hỗ trợ mới sẽ hiển thị tại đây."
                className="border-0 bg-transparent"
              />
            ) : (
              openTickets
                .filter((ticket) => ticket.status !== 'resolved')
                .slice(0, 5)
                .map((ticket) => (
                  <Link
                    key={ticket.id}
                    href="/admin/tickets"
                    className="flex items-center gap-3 border-b border-border px-5 py-4 transition-all hover:bg-muted/50 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-heading">{ticket.type}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {ticket.creator?.name ?? 'Khách'} · {ticket.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </Link>
                ))
            )}
          </div>
        </section>
      ) : null}

      {!isAdmin && (
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/70 px-5 py-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-heading">Lịch đặt sân gần đây</h2>
              {pendingCount > 0 ? (
                <span className="text-xs font-medium text-brand-600">
                  {pendingCount} chờ xác nhận
                </span>
              ) : null}
            </div>
          </div>

          <div className="bg-card">
            {isLoading ? (
              <div className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
            ) : pendingBookings.length === 0 ? (
              <EmptyState
                icon={CalendarDaysIcon}
                title="Chưa có lịch đặt sân"
                description="Các đơn đặt sân gần đây sẽ hiển thị tại đây."
                className="border-0 bg-transparent"
              />
            ) : (
              pendingBookings.map((booking) => {
                const primaryItem = booking.items?.[0];
                return (
                  <Link
                    key={booking.id}
                    href="/bookings"
                    className="flex items-center gap-3 border-b border-border px-5 py-4 transition-all hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-heading">
                        {primaryItem?.court?.name}
                        {primaryItem?.court?.venue?.name ? (
                          <span className="font-normal text-muted-foreground">
                            {' '}
                            · {primaryItem.court.venue.name}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {booking.user?.name} · {primaryItem ? formatDate(primaryItem.date) : '—'}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(booking.createdAt)}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      )}

    </div>
  );
};
