'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOutIcon } from 'lucide-react';

import logoSquare from '@/assets/logo/logo-9-9.png';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { useBooking } from '@/context/booking.context';
import { navSections } from '@/lib/utils/menu-config';
import { useSession } from '@/provider/session-provider';

export const AppSidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useSession();
  const { pendingCount } = useBooking();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const role = user?.role;

  const sections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || (role && item.roles.includes(role))),
    }))
    .filter((section) => section.items.length > 0);

  const badgeByHref: Record<string, number> = {
    '/bookings': pendingCount,
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 rounded-lg border border-transparent hover:border-brand-secondary-400 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Image
            src={logoSquare}
            alt="Minh Đức Booking Sport"
            className="size-8 shrink-0 rounded-lg object-cover"
            priority
          />
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-heading">Minh Đức</p>
              <p className="truncate text-xs text-muted-foreground">Booking Sport ERP</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-1 px-2 py-3">
        {sections.map((section) => (
          <SidebarGroup key={section.label} className="p-0">
            <SidebarGroupLabel className="h-7 px-2 text-xs font-medium text-muted-foreground">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  const badge = badgeByHref[item.href];

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                        className={`h-9 rounded-lg border border-transparent text-sm hover:border-brand-secondary-400 ${
                          active
                            ? 'border-brand-secondary-400 bg-brand-secondary-50 font-semibold text-brand-secondary-700'
                            : ''
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </SidebarMenuButton>
                      {badge > 0 && (
                        <SidebarMenuBadge className="rounded-md bg-brand-secondary-500 text-xs font-semibold text-white">
                          {badge > 99 ? '99+' : badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {user && (
        <SidebarFooter className="border-t border-sidebar-border p-3">
          <div
            className={`flex items-center gap-2.5 rounded-xl border border-transparent bg-muted-surface px-2.5 py-2 ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-heading">{user.name}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-muted-foreground hover:border-brand-secondary-400"
                  aria-label="Đăng xuất"
                  title="Đăng xuất"
                >
                  <LogOutIcon className="size-4" />
                </button>
              </>
            )}
          </div>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
};
