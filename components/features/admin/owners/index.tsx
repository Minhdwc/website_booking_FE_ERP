'use client';

import { PageHeader } from '@/components/custom/page-header';

export function AdminOwnersPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Duyệt chủ sân"
        description="Luồng đăng ký chủ sân đang được rà soát lại. Trang này tạm thời không khả dụng."
      />
    </div>
  );
}
