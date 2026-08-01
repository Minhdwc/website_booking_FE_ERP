import { AuthGuard } from '@/components/layout/auth-guard';
import { ErpShell } from '@/components/layout/erp-shell';
import { RoleGuard } from '@/components/layout/role-guard';

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard>
        <ErpShell>{children}</ErpShell>
      </RoleGuard>
    </AuthGuard>
  );
}
