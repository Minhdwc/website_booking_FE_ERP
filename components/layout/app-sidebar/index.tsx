'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import logoSquare from '@/assets/logo/logo-9-9.png';
import {
  Sidebar,
  SidebarContent,
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
import { cn } from '@/lib/utils';
import { navSections } from '@/lib/utils/menu-config';
import { useSession } from '@/provider/session-provider';
import { usePendingBookings } from '@/stores/queries/booking.query';

export const AppSidebar = () => {
  const pathname = usePathname();
  const { user } = useSession();
  const { pendingCount } = usePendingBookings();
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-white shadow-sm">
      <SidebarHeader className="px-4 py-4">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 rounded-xl border border-transparent',
            collapsed && 'justify-center',
          )}
        >
          <Image
            src={logoSquare}
            alt="Minh Đức Booking Sport"
            className="size-12 shrink-0 rounded-xl object-cover"
            priority
          />
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-lg font-bold tracking-tight text-emerald-700">BOOK SÂN</p>
              <p className="truncate text-xs text-muted-foreground">Điều phối sân thể thao</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-2 px-3 py-2">
        {sections.map((section) => (
          <SidebarGroup key={section.label} className="p-0">
            <SidebarGroupLabel className="h-7 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  const badge = badgeByHref[item.href];

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        size="lg"
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                        className={cn(
                          'h-11 rounded-xl border border-transparent px-3 text-sm font-medium transition-colors',
                          active
                            ? 'data-active:border-emerald-600! data-active:bg-emerald-600! data-active:text-white! shadow-sm hover:bg-emerald-600/90 hover:text-white data-active:[&_svg]:text-white'
                            : 'text-sidebar-foreground hover:bg-emerald-50 hover:text-emerald-700',
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </SidebarMenuButton>
                      {badge > 0 && (
                        <SidebarMenuBadge className="rounded-full bg-emerald-600 px-1.5 text-xs font-semibold text-white">
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
      <SidebarRail />
    </Sidebar>
  );
};
