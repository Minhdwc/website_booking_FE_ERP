import { AuthGuard } from '@/components/layout/auth-guard';
import { ErpShell } from '@/components/layout/erp-shell';

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ErpShell>{children}</ErpShell>
    </AuthGuard>
  );
}
