'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2Icon, ShieldAlertIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { isAdminOnlyRoute } from '@/lib/auth/route-access';
import { useSession } from '@/provider/session-provider';

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useSession();
  const adminOnly = isAdminOnlyRoute(pathname);
  const denied = adminOnly && user?.role !== 'admin';

  useEffect(() => {
    if (!isLoading && denied) {
      router.replace(user?.role === 'owner' ? '/dashboard' : '/login');
    }
  }, [denied, isLoading, router, user?.role]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (denied) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <ShieldAlertIcon className="size-10 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Không có quyền truy cập</h1>
          <p className="text-sm text-muted-foreground">
            Trang này chỉ dành cho quản trị viên hệ thống.
          </p>
        </div>
        <Button size="sm" onClick={() => router.replace('/dashboard')}>
          Về trang chủ
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
