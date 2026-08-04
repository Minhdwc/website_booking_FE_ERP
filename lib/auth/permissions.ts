import type { SessionUser } from '@/lib/auth/session';

export type Permission =
  | 'dashboard:view'
  | 'admin_dashboard:view'
  | 'reports:view'
  | 'admin_reports:view'
  | 'analytics:view'
  | 'calendar:view'
  | 'bookings:view'
  | 'bookings:create'
  | 'bookings:edit'
  | 'bookings:delete'
  | 'bookings:confirm_payment'
  | 'bookings:cancel'
  | 'venues:view'
  | 'venues:create'
  | 'venues:edit'
  | 'venues:delete'
  | 'courts:view'
  | 'courts:create'
  | 'courts:edit'
  | 'courts:delete'
  | 'customers:view'
  | 'reviews:view'
  | 'reviews:delete'
  | 'payments:view'
  | 'payments:confirm'
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'sports:catalog_manage'
  | 'sports:venue_manage'
  | 'payment_methods:catalog_manage'
  | 'payment_methods:venue_manage'
  | 'support_tickets:view'
  | 'support_tickets:edit'
  | 'chat:view'
  | 'admin_owners:view'
  | 'system:reindex';

export type ErpRole = 'admin' | 'owner';

const OWNER_PERMISSIONS: Permission[] = [
  'dashboard:view',
  'reports:view',
  'calendar:view',
  'bookings:view',
  'bookings:create',
  'bookings:edit',
  'bookings:delete',
  'bookings:confirm_payment',
  'bookings:cancel',
  'venues:view',
  'venues:create',
  'venues:edit',
  'venues:delete',
  'courts:view',
  'courts:create',
  'courts:edit',
  'courts:delete',
  'customers:view',
  'reviews:view',
  'reviews:delete',
  'payments:view',
  'payments:confirm',
  'sports:venue_manage',
  'payment_methods:venue_manage',
  'chat:view',
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...OWNER_PERMISSIONS,
  'admin_dashboard:view',
  'admin_reports:view',
  'analytics:view',
  'users:view',
  'users:create',
  'users:edit',
  'users:delete',
  'sports:catalog_manage',
  'payment_methods:catalog_manage',
  'support_tickets:view',
  'support_tickets:edit',
  'admin_owners:view',
  'system:reindex',
];

const ROLE_PERMISSIONS: Record<ErpRole, Permission[]> = {
  admin: ADMIN_PERMISSIONS,
  owner: OWNER_PERMISSIONS,
};

const BACKEND_PERMISSION_ALIASES: Record<string, Permission> = {
  'users:read': 'users:view',
  'users:write': 'users:edit',
  'venues:read': 'venues:view',
  'venues:write': 'venues:edit',
  'courts:read': 'courts:view',
  'courts:write': 'courts:edit',
  'bookings:read': 'bookings:view',
  'bookings:write': 'bookings:edit',
  'payments:read': 'payments:view',
  'payments:write': 'payments:confirm',
  'reviews:read': 'reviews:view',
  'reviews:write': 'reviews:delete',
  'sports:write': 'sports:catalog_manage',
};

function normalizeBackendPermission(value: string): Permission | null {
  if (value in BACKEND_PERMISSION_ALIASES) {
    return BACKEND_PERMISSION_ALIASES[value];
  }
  return (ROLE_PERMISSIONS.admin as readonly string[]).includes(value)
    ? (value as Permission)
    : null;
}

export function getPermissionsForRole(role: string): Permission[] {
  if (role === 'admin') return [...ROLE_PERMISSIONS.admin];
  if (role === 'owner') return [...ROLE_PERMISSIONS.owner];
  return [];
}

export function resolveUserPermissions(user: SessionUser): Permission[] {
  const rolePermissions = getPermissionsForRole(user.role);
  const fromApi = user.permissions ?? [];

  const merged = new Set<Permission>(rolePermissions);
  for (const raw of fromApi) {
    const normalized = normalizeBackendPermission(raw);
    if (normalized) merged.add(normalized);
  }

  return [...merged];
}

export function enrichSessionUser(user: SessionUser): SessionUser {
  return {
    ...user,
    permissions: resolveUserPermissions(user),
  };
}

export function can(user: SessionUser | null | undefined, permission: Permission): boolean {
  if (!user?.permissions?.length) return false;
  return user.permissions.includes(permission);
}

export function canAny(
  user: SessionUser | null | undefined,
  permissions: Permission[],
): boolean {
  if (!permissions.length) return true;
  return permissions.some((permission) => can(user, permission));
}

export function canAll(
  user: SessionUser | null | undefined,
  permissions: Permission[],
): boolean {
  if (!permissions.length) return true;
  return permissions.every((permission) => can(user, permission));
}

export function getDefaultHomeRoute(user: SessionUser | null | undefined): string {
  if (can(user, 'admin_dashboard:view')) return '/admin/dashboard';
  if (can(user, 'dashboard:view')) return '/dashboard';
  return '/login';
}
