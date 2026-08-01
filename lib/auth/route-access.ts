const ADMIN_ONLY_PREFIXES = ['/users', '/analytics', '/admin'];

export function isAdminOnlyRoute(pathname: string): boolean {
  return ADMIN_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
