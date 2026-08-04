import type { SessionUser } from '@/lib/auth/session';
import { can, canAny, getDefaultHomeRoute, type Permission } from '@/lib/auth/permissions';

type RouteRule = {
  prefix: string;
  permission?: Permission;
  anyOf?: Permission[];
};

/** Longest-prefix wins — keep more specific paths first. */
const ROUTE_RULES: RouteRule[] = [
  { prefix: '/admin/dashboard', permission: 'admin_dashboard:view' },
  { prefix: '/admin/reports', permission: 'admin_reports:view' },
  { prefix: '/admin/tickets', permission: 'support_tickets:view' },
  { prefix: '/admin/owners', permission: 'admin_owners:view' },
  { prefix: '/admin', permission: 'admin_dashboard:view' },
  { prefix: '/analytics', permission: 'analytics:view' },
  { prefix: '/users', permission: 'users:view' },
  { prefix: '/dashboard', permission: 'dashboard:view' },
  { prefix: '/reports', permission: 'reports:view' },
  { prefix: '/calendar', permission: 'calendar:view' },
  { prefix: '/bookings', permission: 'bookings:view' },
  { prefix: '/chat', permission: 'chat:view' },
  { prefix: '/courts', permission: 'courts:view' },
  { prefix: '/customers', permission: 'customers:view' },
  { prefix: '/venues', permission: 'venues:view' },
  { prefix: '/reviews', permission: 'reviews:view' },
  {
    prefix: '/sports',
    anyOf: ['sports:catalog_manage', 'sports:venue_manage'],
  },
  {
    prefix: '/payment-method',
    anyOf: ['payment_methods:catalog_manage', 'payment_methods:venue_manage'],
  },
  { prefix: '/account', anyOf: ['dashboard:view', 'admin_dashboard:view'] },
  { prefix: '/owner', anyOf: ['dashboard:view', 'admin_dashboard:view'] },
];

export function getRequiredPermission(pathname: string): Permission | null {
  const rule = ROUTE_RULES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return rule?.permission ?? null;
}

export function isRouteAllowed(user: SessionUser | null | undefined, pathname: string): boolean {
  const rule = ROUTE_RULES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!rule) return true;
  if (rule.anyOf?.length) return canAny(user, rule.anyOf);
  if (rule.permission) return can(user, rule.permission);
  return true;
}

export function getRouteDenialRedirect(user: SessionUser | null | undefined): string {
  return getDefaultHomeRoute(user);
}

/** @deprecated Use isRouteAllowed */
export function isAdminOnlyRoute(pathname: string): boolean {
  const permission = getRequiredPermission(pathname);
  return (
    permission === 'users:view' ||
    permission === 'analytics:view' ||
    permission === 'admin_dashboard:view' ||
    permission === 'admin_reports:view' ||
    permission === 'support_tickets:view' ||
    permission === 'admin_owners:view'
  );
}
