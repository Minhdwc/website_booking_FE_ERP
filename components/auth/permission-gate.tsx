'use client';

import type { ReactNode } from 'react';

import { canAll, canAny, type Permission } from '@/lib/auth/permissions';
import { useSession } from '@/provider/session-provider';

type PermissionGateProps = {
  permission?: Permission;
  anyOf?: Permission[];
  allOf?: Permission[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function PermissionGate({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { user } = useSession();

  const allowed = (() => {
    if (permission) return canAny(user, [permission]);
    if (anyOf?.length) return canAny(user, anyOf);
    if (allOf?.length) return canAll(user, allOf);
    return true;
  })();

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
