'use client';

import { CalendarDays, CreditCard, Star, Landmark, TrendingUp } from 'lucide-react';
import { useSession } from '@/provider/session-provider';

const roleLabels: Record<string, string> = {
  admin: 'Quản trị viên',
  super_staff: 'Quản lý chi nhánh',
  staff: 'Nhân viên',
};

const metrics = [
  {
    label: 'Đặt sân hôm nay',
    value: '—',
    sub: 'chờ xác nhận',
    accent: '#f59e0b',
    bg: '#fffbeb',
    icon: CalendarDays,
  },
  {
    label: 'Sân đang hoạt động',
    value: '—',
    sub: 'trên tổng số',
    accent: '#16a34a',
    bg: '#f0fdf4',
    icon: Landmark,
  },
  {
    label: 'Doanh thu hôm nay',
    value: '—',
    sub: 'VNĐ',
    accent: '#2563eb',
    bg: '#eff6ff',
    icon: CreditCard,
  },
  {
    label: 'Đánh giá mới',
    value: '—',
    sub: 'chưa phản hồi',
    accent: '#7c3aed',
    bg: '#faf5ff',
    icon: Star,
  },
];

function todayStr() {
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
    <div className="flex-1 space-y-6 p-5 md:p-8">
      {/* ── Hero welcome card ── */}
      <div
        className="relative overflow-hidden rounded-2xl px-7 py-6"
        style={{ background: 'linear-gradient(135deg, #021735 0%, #0e2f52 55%, #1a4d7c 100%)' }}
      >
        {/* Green radial glow */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #5bae20 0%, transparent 70%)' }}
        />
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-medium text-white/50">Xin chào trở lại,</p>
            <h1 className="mt-1 text-[26px] font-bold leading-tight text-white">
              {user?.name ?? '—'}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {roleLabel && (
                <span className="rounded-full bg-[#5bae20]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#8dcc2a] ring-1 ring-[#5bae20]/30">
                  {roleLabel}
                </span>
              )}
              <span className="text-[12px] text-white/35 capitalize">{todayStr()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm sm:text-right">
            <TrendingUp className="size-4 text-[#8dcc2a]" />
            <div>
              <p className="text-[11px] text-white/50">Hệ thống</p>
              <p className="text-sm font-semibold text-white">Hoạt động bình thường</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, sub, accent, bg, icon: Icon }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-xl border border-transparent bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ boxShadow: '0 1px 4px rgba(2,23,53,.07), 0 0 0 1px rgba(2,23,53,.05)' }}
          >
            {/* Subtle corner tint */}
            <div
              className="pointer-events-none absolute -right-4 -top-4 size-20 rounded-full opacity-60 transition-opacity group-hover:opacity-100"
              style={{ background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)` }}
            />

            <div className="relative flex items-start justify-between gap-2">
              <div
                className="flex size-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: bg }}
              >
                <Icon className="size-5" style={{ color: accent }} />
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                hôm nay
              </span>
            </div>

            <div className="relative mt-4">
              <p className="text-[32px] font-black leading-none tracking-tight text-[#021735]">
                {value}
              </p>
              <p className="mt-1.5 text-[13px] font-medium text-slate-500">{label}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Placeholder activity area ── */}
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center">
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-slate-100">
          <TrendingUp className="size-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-500">Chưa có dữ liệu hoạt động</p>
        <p className="mt-1 text-xs text-slate-400">
          Biểu đồ và danh sách giao dịch gần nhất sẽ hiển thị ở đây.
        </p>
      </div>
    </div>
  );
}
