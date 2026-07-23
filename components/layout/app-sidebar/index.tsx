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
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar shadow-[2px_0_12px_rgba(0,0,0,0.02)]"
    >
      <SidebarHeader className="px-4 py-4">
        <Link
          href="/dashboard"
          className={cn(
            'group/logo flex items-center gap-3 rounded-xl border border-transparent p-1 transition-all',
            'hover:border-border/80 hover:bg-muted/50',
            collapsed && 'justify-center',
          )}
        >
          <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-600 shadow-sm ring-2 ring-brand-100 transition-all group-hover/logo:ring-brand-200">
            <Image
              src={logoSquare}
              alt="Minh Đức Booking Sport"
              className="size-7 object-cover"
              priority
            />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
                Minh Đức Booking Sport
              </p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-3 py-2">
        {sections.map((section) => (
          <SidebarGroup key={section.label} className="p-0">
            <SidebarGroupLabel className="h-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
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
                          'group relative h-10 rounded-lg border border-transparent px-3 text-sm font-medium transition-all duration-200',
                          active
                            ? 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:text-white data-active:bg-brand-600 data-active:text-white data-active:hover:bg-brand-700 data-active:[&>svg]:text-white'
                            : 'text-sidebar-foreground/80 hover:border-border hover:bg-muted hover:text-sidebar-foreground',
                        )}
                      >
                        <Icon
                          className={cn(
                            'size-4 shrink-0 transition-colors',
                            active
                              ? 'text-white data-active:text-white'
                              : 'text-sidebar-foreground/60 group-hover:text-brand-600',
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </SidebarMenuButton>
                      {badge > 0 && (
                        <SidebarMenuBadge className="rounded-full bg-brand-500 px-1.5 text-[11px] font-semibold text-white shadow-sm">
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
