'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BanknoteIcon,
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
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  daysAgoIsoDate,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  todayIsoDate,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { useSession } from '@/provider/session-provider';
import { usePendingBookings } from '@/stores/queries/booking';
import { useCourts } from '@/stores/queries/court';
import { useAnalyticsOverview } from '@/stores/queries/analytics';
import { useReportSummary } from '@/stores/queries/report';
import { useSupportTickets } from '@/stores/queries/support-ticket';

const STATUS_LABEL: Record<string, string> = {
  waiting_payment: 'Chờ TT',
  confirmed: 'Đã xác nhận',
  cancelled: 'Huỷ',
  completed: 'Hoàn thành',
  expired: 'Hết hạn',
  paid_at_venue: 'Tại quầy',
};

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

const ownerShortcuts = [
  { title: 'Lịch sân', href: '/calendar', icon: CalendarDaysIcon, description: 'Tuần hiện tại' },
  { title: 'Đặt sân', href: '/bookings', icon: CalendarDaysIcon, description: 'Chờ xác nhận' },
  { title: 'Thanh toán', href: '/payments', icon: BanknoteIcon, description: 'Giao dịch' },
  { title: 'Sân', href: '/courts', icon: MapPinnedIcon, description: 'Danh sách sân' },
  { title: 'Cơ sở', href: '/venues', icon: LandmarkIcon, description: 'Quản lý cơ sở' },
  {
    title: 'PT thanh toán',
    href: '/payment-method',
    icon: WalletCardsIcon,
    description: 'Cấu hình thu tiền',
  },
];

const adminShortcuts = [
  { title: 'Hỗ trợ', href: '/admin/tickets', icon: UsersIcon, description: 'Ticket hệ thống' },
  { title: 'Báo cáo', href: '/admin/reports', icon: ChartColumnIcon, description: 'Toàn hệ thống' },
  { title: 'Tài khoản', href: '/users', icon: UsersIcon, description: 'Quản lý user' },
  { title: 'Bộ môn', href: '/sports', icon: MapPinnedIcon, description: 'Danh mục bộ môn' },
];

function countByStatus(
  rows: { status: string; count: number }[] | undefined,
  status: string,
) {
  return rows?.find((row) => row.status === status)?.count ?? 0;
}

type HomeProps = {
  variant?: 'owner' | 'admin';
};

export const Home = ({ variant = 'owner' }: HomeProps) => {
  const { user } = useSession();
  const isAdmin = variant === 'admin' || user?.role === 'admin';
  const [from, setFrom] = useState(daysAgoIsoDate(30));
  const [to, setTo] = useState(todayIsoDate());
  const [appliedRange, setAppliedRange] = useState({ from: daysAgoIsoDate(30), to: todayIsoDate() });

  const { pendingBookings, pendingCount, isLoading } = usePendingBookings();
  const { data: reportSummary, isLoading: isReportLoading } = useReportSummary(appliedRange);
  const { data: analytics, isLoading: isAnalyticsLoading } = useAnalyticsOverview(appliedRange, {
    enabled: isAdmin,
  });
  const { data: courts = [], isLoading: isCourtsLoading } = useCourts(
    { limit: '100' },
  );
  const { data: openTickets = [] } = useSupportTickets({ limit: '100' }, { enabled: isAdmin });

  const openTicketCount = useMemo(
    () => openTickets.filter((ticket) => ticket.status !== 'resolved').length,
    [openTickets],
  );

  const activeCourts = useMemo(
    () => courts.filter((court) => court.status === 'active').length,
    [courts],
  );

  const revenueTotal = reportSummary?.revenue.total ?? 0;
  const totalBookings =
    reportSummary?.bookingsByStatus.reduce((sum, row) => sum + row.count, 0) ?? 0;
  const confirmedCount = countByStatus(reportSummary?.bookingsByStatus, 'confirmed');
  const cancelledCount = countByStatus(reportSummary?.bookingsByStatus, 'cancelled');
  const topCourts = reportSummary?.topCourts ?? [];

  const statusChartData = useMemo(
    () =>
      (reportSummary?.bookingsByStatus ?? []).map((row) => ({
        status: STATUS_LABEL[row.status] ?? row.status,
        count: row.count,
      })),
    [reportSummary?.bookingsByStatus],
  );

  const revenueChartData = useMemo(
    () =>
      (reportSummary?.revenueByDay ?? []).map((row) => ({
        date: row.date.slice(5),
        total: row.total,
      })),
    [reportSummary?.revenueByDay],
  );

  const sportChartData = useMemo(
    () =>
      (reportSummary?.revenueBySport ?? []).map((row) => ({
        name: row.sportName,
        total: row.total,
      })),
    [reportSummary?.revenueBySport],
  );

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

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng doanh thu"
          value={isReportLoading ? '—' : formatCurrency(revenueTotal)}
          description={isReportLoading ? undefined : 'Theo khoảng ngày đã chọn'}
          icon={WalletCardsIcon}
          loading={isReportLoading}
        />
        <StatCard
          title="Tổng lượt đặt"
          value={isReportLoading ? '—' : totalBookings}
          description={
            isReportLoading
              ? undefined
              : `${confirmedCount} xác nhận · ${cancelledCount} huỷ`
          }
          icon={CalendarDaysIcon}
          loading={isReportLoading}
        />
        <StatCard
          title={isAdmin ? 'Ticket mở' : 'Chờ xác nhận'}
          value={isAdmin ? openTicketCount : pendingCount}
          description={isAdmin ? 'Chưa resolved' : 'Waiting payment'}
          icon={isAdmin ? UsersIcon : CalendarDaysIcon}
          loading={isAdmin ? false : isLoading}
        />
        <StatCard
          title={isAdmin ? 'Doanh thu đã thu' : 'Sân hoạt động'}
          value={
            isAdmin
              ? isReportLoading
                ? '—'
                : reportSummary?.revenue.paidCount ?? 0
              : isCourtsLoading
                ? '—'
                : activeCourts
          }
          description={isAdmin ? 'Giao dịch thành công' : `/${courts.length} sân`}
          icon={isAdmin ? BanknoteIcon : MapPinnedIcon}
          loading={isAdmin ? isReportLoading : isCourtsLoading}
        />
      </section>

      {!isAdmin && (
        <section className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-heading">Biểu đồ hoạt động</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(appliedRange.from)} – {formatDate(appliedRange.to)}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="home-from" className="text-xs">
                  Từ
                </Label>
                <Input
                  id="home-from"
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="h-8 w-36 bg-card text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="home-to" className="text-xs">
                  Đến
                </Label>
                <Input
                  id="home-to"
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className="h-8 w-36 bg-card text-xs"
                />
              </div>
              <Button size="sm" variant="outline" onClick={() => setAppliedRange({ from, to })}>
                Áp dụng
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">Doanh thu theo ngày</h3>
              {isReportLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : revenueChartData.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
              ) : (
                <ChartContainer
                  config={{ total: { label: 'Doanh thu', color: 'var(--chart-1)' } }}
                  className="aspect-auto h-48 w-full"
                >
                  <AreaChart data={revenueChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={48} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="var(--color-total)"
                      fill="var(--color-total)"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">Lượt đặt theo trạng thái</h3>
              {isReportLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : statusChartData.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
              ) : (
                <ChartContainer
                  config={{ count: { label: 'Số lượng', color: 'var(--chart-2)' } }}
                  className="aspect-auto h-48 w-full"
                >
                  <BarChart data={statusChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="status" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={6} />
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">Doanh thu theo môn</h3>
              {isReportLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : sportChartData.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
              ) : (
                <ChartContainer
                  config={{ total: { label: 'Doanh thu', color: 'var(--chart-1)' } }}
                  className="aspect-auto h-48 w-full"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie
                      data={sportChartData}
                      dataKey="total"
                      nameKey="name"
                      innerRadius={45}
                      paddingAngle={2}
                    >
                      {sportChartData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">Top sân theo lượt đặt</h3>
              {isReportLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : topCourts.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs">Sân</TableHead>
                      <TableHead className="text-xs">Cơ sở</TableHead>
                      <TableHead className="text-right text-xs">Lượt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCourts.slice(0, 5).map((row) => (
                      <TableRow key={row.courtId}>
                        <TableCell className="py-2 text-sm font-medium">
                          {row.court?.name ?? row.courtId}
                        </TableCell>
                        <TableCell className="py-2 text-sm text-muted-foreground">
                          {row.court?.venue?.name ?? '—'}
                        </TableCell>
                        <TableCell className="py-2 text-right tabular-nums text-sm">
                          {row.bookingCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </section>
      )}

      {isAdmin && (
        <section className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-heading">Analytics hệ thống</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(appliedRange.from)} – {formatDate(appliedRange.to)}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="admin-from" className="text-xs">
                  Từ
                </Label>
                <Input
                  id="admin-from"
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="h-8 w-36 bg-card text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="admin-to" className="text-xs">
                  Đến
                </Label>
                <Input
                  id="admin-to"
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className="h-8 w-36 bg-card text-xs"
                />
              </div>
              <Button size="sm" variant="outline" onClick={() => setAppliedRange({ from, to })}>
                Áp dụng
              </Button>
            </div>
          </div>

          {isAnalyticsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (analytics?.topVenues ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu cơ sở</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Cơ sở</TableHead>
                  <TableHead className="text-xs">Khu vực</TableHead>
                  <TableHead className="text-right text-xs">Lượt đặt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(analytics?.topVenues ?? []).slice(0, 5).map((row) => (
                  <TableRow key={row.venueId}>
                    <TableCell className="py-2 text-sm font-medium">
                      {row.venue?.name ?? row.venueId}
                    </TableCell>
                    <TableCell className="py-2 text-sm text-muted-foreground">
                      {row.venue?.location ?? '—'}
                    </TableCell>
                    <TableCell className="py-2 text-right tabular-nums text-sm">
                      {row.bookingCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      )}

      <section className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-heading">Lối tắt nhanh</h2>
          <Link
            href={isAdmin ? '/admin/reports' : '/reports'}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-brand-600 hover:underline"
          >
            <ChartColumnIcon className="size-3.5" />
            Báo cáo
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              <Link href="/admin/tickets" className="text-xs font-medium text-brand-600 hover:underline">
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
                <Link href="/bookings" className="text-xs font-medium text-brand-600 hover:underline">
                  {pendingCount} chờ xác nhận
                </Link>
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
                        {booking.user?.name ?? booking.customerName} ·{' '}
                        {primaryItem ? formatDate(primaryItem.date) : '—'}
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
