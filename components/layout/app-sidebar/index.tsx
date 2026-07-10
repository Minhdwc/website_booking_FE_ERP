'use client';

import Image from 'next/image';
import Link from 'next/link';

import logoSquare from '@/assets/logo/logo-9-9.png';
import { SideBarMenu } from './side-bar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
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
                <span className="truncate font-semibold text-heading">Minh Đức Booking</span>
                <span className="truncate text-xs text-muted-foreground">
                  Quản lý đặt sân thể thao
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SideBarMenu />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
