'use client';

import Link from 'next/link';
import { LandPlotIcon, LandmarkIcon } from 'lucide-react';

import { DialogCreateField } from '@/components/features/fields/dialog-create-field';
import { buttonVariants } from '@/components/ui/button';

export const FieldsSetupPage = ({ hasVenues }: { hasVenues: boolean }) => {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <LandPlotIcon className="size-7" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-foreground">Chưa có sân nào</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {hasVenues
          ? 'Tạo sân gắn với cơ sở để khách có thể đặt lịch.'
          : 'Bạn cần có ít nhất một cơ sở trước khi tạo sân.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {hasVenues ? (
          <DialogCreateField />
        ) : (
          <Link href="/venues" className={`${buttonVariants({ size: 'sm' })} gap-1.5`}>
            <LandmarkIcon className="size-3.5" />
            Quản lý cơ sở
          </Link>
        )}
      </div>
    </div>
  );
};
