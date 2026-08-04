import { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Landmark,
  MapPinned,
  Dumbbell,
  WalletCards,
  BarChart3,
  LineChart,
  MessageCircle,
  Star,
  Users,
  UserRound,
  LifeBuoy,
  Banknote,
} from 'lucide-react';

import type { Permission } from '@/lib/auth/permissions';

export type NavItem = {
  title: string;
  description?: string;
  href: string;
  icon: LucideIcon;
  /** @deprecated Prefer `permissions` */
  roles?: string[];
  permissions?: Permission[];
  anyOfPermissions?: Permission[];
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    label: 'Chính',
    items: [
      {
        title: 'Trang chủ',
        href: '/dashboard',
        icon: LayoutDashboard,
        permissions: ['dashboard:view'],
        description: 'Tổng quan đặt sân và doanh thu',
      },
      {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        permissions: ['admin_dashboard:view'],
        description: 'Ticket hỗ trợ và báo cáo hệ thống',
      },
      {
        title: 'Báo cáo',
        href: '/reports',
        icon: BarChart3,
        permissions: ['reports:view'],
        description: 'Doanh thu và lượt đặt',
      },
      {
        title: 'Báo cáo hệ thống',
        href: '/admin/reports',
        icon: BarChart3,
        permissions: ['admin_reports:view'],
        description: 'Thống kê toàn nền tảng',
      },
      {
        title: 'Phân tích',
        href: '/analytics',
        icon: LineChart,
        permissions: ['analytics:view'],
        description: 'Xu hướng và chỉ số',
      },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      {
        title: 'Lịch sân',
        href: '/calendar',
        icon: CalendarRange,
        permissions: ['calendar:view'],
        description: 'Lịch tuần hiện tại',
      },
      {
        title: 'Đặt sân',
        href: '/bookings',
        icon: CalendarDays,
        permissions: ['bookings:view'],
        description: 'Giữ chỗ và xác nhận đơn',
      },
      {
        title: 'Thanh toán',
        href: '/payments',
        icon: Banknote,
        permissions: ['payments:view'],
        description: 'Giao dịch thanh toán',
      },
      {
        title: 'Chat',
        href: '/chat',
        icon: MessageCircle,
        permissions: ['chat:view'],
        description: 'Tin nhắn khách hàng',
      },
      {
        title: 'Sân',
        href: '/courts',
        icon: MapPinned,
        permissions: ['courts:view'],
        description: 'Quản lý danh sách sân',
      },
      {
        title: 'Khách hàng',
        href: '/customers',
        icon: UserRound,
        permissions: ['customers:view'],
        description: 'Danh sách khách đặt sân',
      },
      {
        title: 'Cơ sở',
        href: '/venues',
        icon: Landmark,
        permissions: ['venues:view'],
        description: 'Thông tin cơ sở thể thao',
      },
      {
        title: 'Đánh giá',
        href: '/reviews',
        icon: Star,
        permissions: ['reviews:view'],
        description: 'Phản hồi từ khách',
      },
    ],
  },
  {
    label: 'Quản trị',
    items: [
      {
        title: 'Hỗ trợ',
        href: '/admin/tickets',
        icon: LifeBuoy,
        permissions: ['support_tickets:view'],
        description: 'Ticket hệ thống',
      },
    ],
  },
  {
    label: 'Danh mục',
    items: [
      {
        title: 'Bộ môn',
        href: '/sports',
        icon: Dumbbell,
        anyOfPermissions: ['sports:catalog_manage', 'sports:venue_manage'],
        description: 'Danh mục bộ môn',
      },
      {
        title: 'Phương thức TT',
        href: '/payment-method',
        icon: WalletCards,
        anyOfPermissions: ['payment_methods:catalog_manage', 'payment_methods:venue_manage'],
        description: 'Cấu hình thanh toán',
      },
      {
        title: 'Tài khoản',
        href: '/users',
        icon: Users,
        permissions: ['users:view'],
        description: 'Quản lý người dùng',
      },
    ],
  },
];

export function isNavItemVisible(
  item: NavItem,
  check: {
    can: (permission: Permission) => boolean;
    canAny: (permissions: Permission[]) => boolean;
    role?: string;
  },
): boolean {
  if (item.anyOfPermissions?.length) {
    return check.canAny(item.anyOfPermissions);
  }

  if (item.permissions?.length) {
    return check.canAny(item.permissions);
  }

  if (item.roles?.length) {
    return Boolean(check.role && item.roles.includes(check.role));
  }

  return true;
}
