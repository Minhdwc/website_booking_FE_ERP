'use client';

import Link from 'next/link';
import { CalendarDays, CalendarPlus, CreditCard, Landmark, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSession } from '@/provider/session-provider';

const roleLabels: Record<string, string> = {
  admin: 'Quản trị viên',
  super_staff: 'Quản lý chi nhánh',
  staff: 'Nhân viên',
};

const kpis = [
  { label: 'Đặt sân hôm nay', value: '—', sub: 'chờ xác nhận', icon: CalendarDays, featured: true },
  { label: 'Sân đang hoạt động', value: '—', sub: 'trên tổng số', icon: Landmark },
  { label: 'Doanh thu hôm nay', value: '—', sub: 'VNĐ', icon: CreditCard },
  { label: 'Đánh giá mới', value: '—', sub: 'chưa phản hồi', icon: Star },
];

function todayLabel() {
  return new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const { user } = useSession();
  const roleLabel = user ? (roleLabels[user.role] ?? user.role) : '';

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Xin chào trở lại,</p>
          <h1 className="mt-0.5 text-xl font-semibold text-heading">{user?.name ?? '—'}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {roleLabel ? <Badge variant="secondary">{roleLabel}</Badge> : null}
            <span className="text-xs capitalize text-muted-foreground">{todayLabel()}</span>
          </div>
        </div>
        <Button
          className="w-full sm:w-auto"
          size="lg"
          nativeButton={false}
          render={<Link href="/bookings" />}
        >
          <CalendarPlus data-icon="inline-start" />
          Tạo đặt sân
        </Button>
      </header>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, sub, icon: Icon, featured }) => (
          <div
            key={label}
            className={`rounded-xl bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${
              featured ? 'ring-2 ring-brand-secondary-500/25' : ''
            }`}
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-secondary-50 text-brand-secondary-500">
              <Icon className="size-5" />
            </div>
            <p className="mt-4 text-3xl font-bold tabular-nums text-heading">{value}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      {/* Mid: overview + activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-surface p-5 shadow-card lg:col-span-2">
          <h2 className="text-sm font-semibold text-heading">Tổng quan hôm nay</h2>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-secondary-50 text-brand-secondary-500">
              <CalendarDays className="size-5" />
            </div>
            <p className="text-sm font-semibold text-heading">Chưa có booking hôm nay</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Khi có đặt sân mới, tổng hợp sẽ hiện tại đây.
            </p>
            <Button size="sm" className="mt-4" nativeButton={false} render={<Link href="/bookings" />}>
              Tạo đặt sân
            </Button>
          </div>
        </div>

        <div className="rounded-xl bg-surface p-5 shadow-card">
          <h2 className="text-sm font-semibold text-heading">Hoạt động gần đây</h2>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-secondary-50 text-brand-secondary-500">
              <Star className="size-5" />
            </div>
            <p className="text-sm font-semibold text-heading">Chưa có hoạt động gần đây</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Đánh giá và phản hồi sẽ xuất hiện tại đây.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              nativeButton={false}
              render={<Link href="/reviews" />}
            >
              Xem đánh giá
            </Button>
          </div>
        </div>
      </div>

      {/* Footer status */}
      <footer className="flex flex-col gap-3 rounded-xl bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-heading">Hệ thống hoạt động bình thường</p>
          <p className="text-xs text-muted-foreground">Tất cả dịch vụ đang sẵn sàng</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/reviews"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted-surface hover:text-heading"
          >
            Đánh giá
          </Link>
          <Link
            href="/payments"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted-surface hover:text-heading"
          >
            Thanh toán
          </Link>
        </div>
      </footer>
    </div>
  );
}
