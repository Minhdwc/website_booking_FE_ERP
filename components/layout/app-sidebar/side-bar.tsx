'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { navConfig, type NavItem, type NavLeaf } from '@/lib/utils/menu-config';
import { useBooking } from '@/context/booking.context';

function NavIcon({ icon: Icon }: { icon: NavItem['icon'] }) {
  return <Icon className="size-4 shrink-0" />;
}

export function SideBarMenu() {
  const pathname = usePathname();
  const { badgeCounts } = useBooking();
  const isActive = (href?: string) =>
    !!href && (pathname === href || pathname.startsWith(`${href}/`));

  const getBadgeCount = (leaf: NavLeaf) => {
    if (!leaf.badgeKey) return 0;
    return badgeCounts[leaf.badgeKey];
  };

  const renderNavItem = (item: NavItem) => {
    if (item.href && !item.items) {
      return (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            isActive={isActive(item.href)}
            tooltip={item.title}
            render={<Link href={item.href} />}
            className="data-active:bg-brand-secondary-50 data-active:font-medium data-active:text-brand-secondary-600"
          >
            <NavIcon icon={item.icon} />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    const isGroupActive = item.items?.some((leaf) => isActive(leaf.href));

    return (
      <SidebarMenuItem key={item.title}>
        <Collapsible defaultOpen={isGroupActive} className="group/collapsible">
          <CollapsibleTrigger
            render={<SidebarMenuButton tooltip={item.title} isActive={isGroupActive} />}
          >
            <NavIcon icon={item.icon} />
            <span>{item.title}</span>
            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items?.map((leaf) => (
                <SidebarMenuSubItem key={leaf.href}>
                  <SidebarMenuSubButton
                    isActive={isActive(leaf.href)}
                    render={<Link href={leaf.href} />}
                    className="data-active:bg-brand-secondary-50 data-active:font-medium data-active:text-brand-secondary-600"
                  >
                    <span>{leaf.title}</span>
                    {getBadgeCount(leaf) > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-secondary-500 px-1.5 text-[10px] font-semibold text-white">
                        {getBadgeCount(leaf) > 99 ? '99+' : getBadgeCount(leaf)}
                      </span>
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  };

  return (
    <>
      {navConfig.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">{group.items.map(renderNavItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
