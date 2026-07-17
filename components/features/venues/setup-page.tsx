'use client';

import Link from 'next/link';
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  HelpCircleIcon,
  LandPlotIcon,
  LandmarkIcon,
} from 'lucide-react';

import { VenuesCreateDialog } from '@/components/features/venues/dialog-create';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: LandmarkIcon,
    title: 'Tạo cơ sở',
    description: 'Khai báo tên, địa chỉ và giờ hoạt động của cơ sở.',
    active: true,
  },
  {
    icon: LandPlotIcon,
    title: 'Tạo sân',
    description: 'Gắn các sân thể thao vào cơ sở vừa tạo.',
    active: false,
  },
  {
    icon: CalendarCheckIcon,
    title: 'Nhận booking',
    description: 'Khách đặt sân và bạn quản lý lịch ngay trên hệ thống.',
    active: false,
  },
];

export const VenuesSetupPage = ({
  onReplayTour,
  searchQuery,
  onClearSearch,
}: {
  onReplayTour: () => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}) => {
  const hasSearch = Boolean(searchQuery?.trim());

  return (
    <div
      id="venues-setup-empty"
      className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-secondary-50 text-brand-secondary-600 ring-8 ring-brand-secondary-50/50">
        <LandmarkIcon className="size-7" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-heading">
        {hasSearch ? 'Không tìm thấy cơ sở nào' : 'Chưa có cơ sở nào'}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {hasSearch
          ? `Không có cơ sở nào khớp với “${searchQuery}”. Thử từ khoá khác hoặc tạo cơ sở mới.`
          : 'Tạo cơ sở mới để bắt đầu quản lý sân và nhận booking.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <VenuesCreateDialog />
        {hasSearch && onClearSearch ? (
          <Button size="sm" variant="outline" onClick={onClearSearch}>
            Xoá tìm kiếm
          </Button>
        ) : null}
        <Button size="sm" variant="outline" onClick={onReplayTour}>
          <HelpCircleIcon className="size-3.5" />
          Xem hướng dẫn
        </Button>
      </div>

      <div className="mt-10 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={
              step.active
                ? 'rounded-xl border border-brand-secondary-600/25 bg-brand-secondary-50/40 p-4'
                : 'rounded-xl border border-border/60 bg-muted/20 p-4'
            }
          >
            <div className="flex items-center gap-2">
              <span
                className={
                  step.active
                    ? 'flex size-6 items-center justify-center rounded-full bg-brand-secondary-600 text-xs font-semibold text-white'
                    : 'flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground'
                }
              >
                {index + 1}
              </span>
              <step.icon
                className={
                  step.active ? 'size-4 text-brand-secondary-600' : 'size-4 text-muted-foreground'
                }
              />
            </div>
            <p className="mt-2.5 text-sm font-semibold text-heading">{step.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>

      <div id="venues-setup-next" className="mt-8 text-xs text-muted-foreground">
        <Link
          href="/fields"
          className="inline-flex items-center gap-1 underline-offset-4 hover:text-foreground hover:underline"
        >
          Tiếp theo: tạo sân
          <ArrowRightIcon className="size-3" />
        </Link>
      </div>
    </div>
  );
};
