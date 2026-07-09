'use client';

import { useSession } from '@/provider/session-provider';

export default function DashboardPage() {
  const { user } = useSession();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Tổng quan vận hành</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Xin chào {user?.name}. Bạn đang đăng nhập với vai trò{' '}
        <span className="font-medium text-foreground">{user?.role}</span>.
      </p>
    </div>
  );
}
