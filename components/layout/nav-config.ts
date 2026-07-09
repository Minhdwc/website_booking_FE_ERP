import { Bell, CalendarDays, Landmark, LayoutDashboard, Receipt, Star, Users } from 'lucide-react';

export const navConfig = [
  {
    label: 'Tổng quan',
    items: [{ title: 'Tổng quan', icon: LayoutDashboard, href: '/dashboard' }],
  },
  {
    label: 'Công việc',
    items: [
      {
        title: 'Đặt sân',
        icon: CalendarDays,
        items: [
          {
            title: 'Danh sách đặt sân',
            href: '/bookings',
            badgeKey: 'pendingBookings',
          },
        ],
      },
      {
        title: 'Sân & cơ sở',
        icon: Landmark,
        items: [
          { title: 'Chi nhánh', href: '/venues' },
          { title: 'Sân thi đấu', href: '/fields' },
          { title: 'Môn thể thao', href: '/sports' },
          { title: 'Khung giờ', href: '/timeslots' },
        ],
      },
      {
        title: 'Thanh toán',
        icon: Receipt,
        items: [
          {
            title: 'Phương thức thanh toán',
            href: '/payment-methods',
            badgeKey: 'pendingPayments',
          },
          {
            title: 'Giao dịch',
            href: '/payments',
            badgeKey: 'overduePayments',
          },
        ],
      },
      { title: 'Đánh giá', icon: Star, href: '/reviews' },
    ],
  },
  {
    label: 'Quản trị',
    items: [
      { title: 'Người dùng', icon: Users, href: '/users' },
      { title: 'Thông báo', icon: Bell, href: '/notifications' },
    ],
  },
];

export const navTitleByHref: Record<string, string> = Object.fromEntries(
  navConfig.flatMap((group) =>
    group.items.flatMap((item) => [
      ...(item.href ? [[item.href, item.title] as const] : []),
      ...(item.items?.map((leaf) => [leaf.href, leaf.title] as const) ?? []),
    ]),
  ),
);

export function isNavHrefActive(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  return href !== '/dashboard' && pathname.startsWith(`${href}/`);
}
