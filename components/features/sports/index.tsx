'use client';

import { AdminSportsView } from '@/components/features/sports/admin/admin-view';
import { StaffSportsView } from '@/components/features/sports/staff/staff-view';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/provider/session-provider';

export const SportsPage = () => {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (user?.role === 'admin') {
    return <AdminSportsView />;
  }

  return <StaffSportsView />;
};
