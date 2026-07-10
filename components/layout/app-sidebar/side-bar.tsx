'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BuildingIcon, ChevronRight, HomeIcon } from 'lucide-react';
import { Icon } from '@iconify/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

const menu = [
  {
    name: 'Trang chủ',
    icon: <HomeIcon />,
    href: '/dashboard',
  },
  {
    name: 'Đặt sân',
    icon: <Icon icon="mdi:calendar-check-outline" className="size-4" />,
    subMenu: [
      {
        name: 'Danh sách đặt sân',
        icon: <Icon icon="mdi:format-list-bulleted" className="size-4" />,
        href: '/bookings',
      },
    ],
  },
  {
    name: 'Đơn vị quản lý',
    icon: <BuildingIcon />,
    subMenu: [
      { name: 'Cơ sở', icon: <Icon icon="mdi:stadium" className="size-4" />, href: '/venues' },
      {
        name: 'Sân thi đấu',
        icon: <Icon icon="mdi:soccer-field" className="size-4" />,
        href: '/fields',
      },
      {
        name: 'Môn thể thao',
        icon: <Icon icon="mdi:basketball" className="size-4" />,
        href: '/sports',
      },
      {
        name: 'Khung giờ',
        icon: <Icon icon="mdi:clock-outline" className="size-4" />,
        href: '/timeslots',
      },
    ],
  },
  {
    name: 'Thanh toán',
    icon: <Icon icon="mdi:cash-multiple" className="size-4" />,
    subMenu: [
      {
        name: 'Phương thức thanh toán',
        icon: <Icon icon="mdi:credit-card-outline" className="size-4" />,
        href: '/payment-methods',
      },
      {
        name: 'Giao dịch',
        icon: <Icon icon="mdi:receipt-text-outline" className="size-4" />,
        href: '/payments',
      },
    ],
  },
  {
    name: 'Đánh giá',
    icon: <Icon icon="mdi:star-outline" className="size-4" />,
    href: '/reviews',
  },
  {
    name: 'Người dùng',
    icon: <Icon icon="mdi:account-group-outline" className="size-4" />,
    href: '/users',
  },
  {
    name: 'Thông báo',
    icon: <Icon icon="mdi:bell-outline" className="size-4" />,
    href: '/notifications',
  },
];

export function SideBarMenu() {
  const pathname = usePathname();
  const isActive = (href?: string) =>
    !!href && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <SidebarMenu className="gap-1">
      {menu.map((item) => {
        if (item.href && !item.subMenu) {
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                isActive={isActive(item.href)}
                tooltip={item.name}
                render={<Link href={item.href} />}
                className="data-active:bg-brand-secondary-50 data-active:font-medium data-active:text-brand-secondary-600"
              >
                {item.icon}
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }

        const isGroupActive = item.subMenu?.some((leaf) => isActive(leaf.href));

        return (
          <SidebarMenuItem key={item.name}>
            <Collapsible defaultOpen={isGroupActive} className="group/collapsible">
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton tooltip={item.name} isActive={isGroupActive} />
                }
              >
                {item.icon}
                <span>{item.name}</span>
                <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.subMenu?.map((leaf) => (
                    <SidebarMenuSubItem key={leaf.href}>
                      <SidebarMenuSubButton
                        isActive={isActive(leaf.href)}
                        render={<Link href={leaf.href} />}
                        className="data-active:bg-brand-secondary-50 data-active:font-medium data-active:text-brand-secondary-600"
                      >
                        {leaf.icon}
                        <span>{leaf.name}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
