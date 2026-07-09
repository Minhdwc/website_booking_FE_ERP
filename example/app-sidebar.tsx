'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, CalendarCheck2 } from 'lucide-react';

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { navConfig } from './nav-config';
import { useNavBadges } from './use-nav-badges';
import { UserMenu } from './user-menu';

export function AppSidebar() {
  const pathname = usePathname();
  const badges = useNavBadges();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <CalendarCheck2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">SanViet ERP</span>
                <span className="truncate text-xs text-muted-foreground">
                  Quản lý đặt sân thể thao
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navConfig.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  // Leaf item with a direct href (no sub-items)
                  if (item.href && !item.items) {
                    const isActive = pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  // Parent item with sub-items
                  const isGroupActive = item.items?.some((leaf) => pathname === leaf.href);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Collapsible defaultOpen={isGroupActive} className="group/collapsible">
                        <CollapsibleTrigger
                          render={
                            <SidebarMenuButton tooltip={item.title} isActive={isGroupActive} />
                          }
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((leaf) => {
                              const count = leaf.badgeKey ? badges[leaf.badgeKey] : undefined;
                              return (
                                <SidebarMenuSubItem key={leaf.href}>
                                  <SidebarMenuSubButton
                                    render={<Link href={leaf.href} />}
                                    isActive={pathname === leaf.href}
                                  >
                                    <span>{leaf.title}</span>
                                  </SidebarMenuSubButton>
                                  {!!count && (
                                    <SidebarMenuBadge className="text-destructive">
                                      {count}
                                    </SidebarMenuBadge>
                                  )}
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
