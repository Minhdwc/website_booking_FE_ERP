'use client';

import Link from 'next/link';

import { PageHeader } from '@/components/custom/page-header';
import { Button } from '@/components/ui/button';

export function OwnerPendingPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8">
      <PageHeader
        title="Trạng thái duyệt"
        description="Luồng duyệt hồ sơ chủ sân đang được rà soát lại."
      />
      <Button render={<Link href="/dashboard" />}>Về trang chủ</Button>
    </div>
  );
}
