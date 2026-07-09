import { AuthGuard } from '@/components/layout/auth-guard';

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
