'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

import logoSquare from '@/assets/logo/logo-9-9.png';
import { navConfig, isNavHrefActive } from '@/components/layout/nav-config';
import { UserMenu } from '@/components/layout/user-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <Image
                src={logoSquare}
                alt="Minh Đức Booking Sport"
                className="size-8 rounded-md object-cover"
                priority
              />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">Minh Đức Booking</span>
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
                  if (item.href && !item.items) {
                    const isActive = isNavHrefActive(pathname, item.href);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.title}
                          render={<Link href={item.href} />}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  const isGroupActive = item.items?.some((leaf) =>
                    isNavHrefActive(pathname, leaf.href),
                  );

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
                              return (
                                <SidebarMenuSubItem key={leaf.href}>
                                  <SidebarMenuSubButton
                                    isActive={isNavHrefActive(pathname, leaf.href)}
                                    render={<Link href={leaf.href} />}
                                  >
                                    <span>{leaf.title}</span>
                                  </SidebarMenuSubButton>
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
