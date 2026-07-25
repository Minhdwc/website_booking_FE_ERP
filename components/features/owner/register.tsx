'use client';

import Link from 'next/link';

import { PageHeader } from '@/components/custom/page-header';
import { Button } from '@/components/ui/button';

export function OwnerRegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8">
      <PageHeader
        title="Đăng ký chủ sân"
        description="Luồng đăng ký chủ sân đang được rà soát lại. Vui lòng cấu hình phương thức thanh toán tại menu Phương thức TT."
      />
      <Button render={<Link href="/payment-method" />}>Đến Phương thức TT</Button>
    </div>
  );
}
