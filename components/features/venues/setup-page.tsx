'use client';

import Link from 'next/link';
import { HelpCircleIcon, LandmarkIcon } from 'lucide-react';

import { VenuesCreateDialog } from '@/components/features/venues/create-dialog';
import { Button } from '@/components/ui/button';

export const VenuesSetupPage = ({ onReplayTour }: { onReplayTour: () => void }) => {
  return (
    <div
      id="venues-setup-empty"
      className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-secondary-50 text-brand-secondary-600">
        <LandmarkIcon className="size-6" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-heading">Chưa liên kết cơ sở nào</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Tài khoản của bạn chưa được gắn với cơ sở. Tạo cơ sở mới để bắt đầu quản lý sân và nhận
        booking.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <VenuesCreateDialog />
        <Button size="sm" variant="outline" className="rounded-lg" onClick={onReplayTour}>
          <HelpCircleIcon className="size-3.5" />
          Xem hướng dẫn
        </Button>
      </div>

      <div id="venues-setup-next" className="mt-8 text-xs text-muted-foreground">
        Tiếp theo:{' '}
        <Link href="/fields" className="underline-offset-4 hover:underline">
          tạo sân
        </Link>
      </div>
    </div>
  );
};
