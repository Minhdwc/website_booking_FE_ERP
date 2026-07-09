import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  CalendarDays,
  Landmark,
  Users,
  Receipt,
  Package,
  Tag,
  UserCog,
  BarChart3,
  Settings,
} from 'lucide-react';

/**
 * A leaf link inside a nav group. `badgeKey`, when present, is resolved at
 * render time against live data (see useNavBadges) — never hardcode a count
 * here. Only wire a badgeKey for numbers that should change the user's next
 * click (booking chờ xác nhận, công nợ quá hạn), not vanity metrics.
 */
export interface NavLeaf {
  title: string;
  href: string;
  badgeKey?: keyof NavBadgeCounts;
}

export interface NavItem {
  title: string;
  icon: LucideIcon;
  href?: string;
  items?: NavLeaf[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface NavBadgeCounts {
  pendingBookings: number;
  overduePayments: number;
}

export const navConfig: NavGroup[] = [
  {
    label: 'Tổng quan',
    items: [{ title: 'Tổng quan', icon: LayoutDashboard, href: '/' }],
  },
  {
    label: 'Nghiệp vụ',
    items: [
      {
        title: 'Đặt sân',
        icon: CalendarDays,
        items: [
          {
            title: 'Lịch đặt sân',
            href: '/dat-san/lich',
            badgeKey: 'pendingBookings',
          },
          { title: 'Đặt sân mới', href: '/dat-san/moi' },
          { title: 'Danh sách đặt sân', href: '/dat-san' },
        ],
      },
      {
        title: 'Sân & cơ sở vật chất',
        icon: Landmark,
        items: [
          { title: 'Danh sách sân', href: '/san' },
          { title: 'Loại sân', href: '/san/loai-san' },
          { title: 'Lịch bảo trì', href: '/san/bao-tri' },
        ],
      },
      {
        title: 'Khách hàng',
        icon: Users,
        items: [
          { title: 'Danh sách khách hàng', href: '/khach-hang' },
          { title: 'Hội viên', href: '/khach-hang/hoi-vien' },
        ],
      },
      {
        title: 'Hóa đơn & thanh toán',
        icon: Receipt,
        items: [
          { title: 'Hóa đơn', href: '/hoa-don' },
          {
            title: 'Công nợ quá hạn',
            href: '/hoa-don/cong-no',
            badgeKey: 'overduePayments',
          },
        ],
      },
      {
        title: 'Dịch vụ & sản phẩm',
        icon: Package,
        items: [
          { title: 'Dịch vụ thuê thêm', href: '/dich-vu' },
          { title: 'Gói hội viên', href: '/dich-vu/goi-hoi-vien' },
        ],
      },
      { title: 'Khuyến mãi', icon: Tag, href: '/khuyen-mai' },
      { title: 'Nhân viên & ca làm', icon: UserCog, href: '/nhan-vien' },
      { title: 'Báo cáo', icon: BarChart3, href: '/bao-cao' },
    ],
  },
  {
    label: 'Quản trị',
    items: [
      { title: 'Người dùng & phân quyền', icon: Users, href: '/quan-tri/nguoi-dung' },
      { title: 'Cài đặt hệ thống', icon: Settings, href: '/quan-tri/cai-dat' },
    ],
  },
];

/** Flat lookup of href -> title, used by the breadcrumb in the header. */
export const navTitleByHref: Record<string, string> = Object.fromEntries(
  navConfig.flatMap((group) =>
    group.items.flatMap((item) => [
      ...(item.href ? [[item.href, item.title] as const] : []),
      ...(item.items?.map((leaf) => [leaf.href, leaf.title] as const) ?? []),
    ]),
  ),
);
