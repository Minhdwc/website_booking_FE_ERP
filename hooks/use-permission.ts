'use client';

import { useMemo } from 'react';

import { can, canAll, canAny, type Permission } from '@/lib/auth/permissions';
import { useSession } from '@/provider/session-provider';

export function usePermission(permission: Permission) {
  const { user } = useSession();
  return useMemo(() => can(user, permission), [user, permission]);
}

export function usePermissions() {
  const { user } = useSession();

  return useMemo(
    () => ({
      user,
      permissions: user?.permissions ?? [],
      can: (permission: Permission) => can(user, permission),
      canAny: (permissions: Permission[]) => canAny(user, permissions),
      canAll: (permissions: Permission[]) => canAll(user, permissions),
    }),
    [user],
  );
}
