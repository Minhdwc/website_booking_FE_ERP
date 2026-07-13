import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  CalendarDays,
  Landmark,
  MapPinned,
  Receipt,
  Users,
  ClipboardList,
  Bell,
  ChartColumn,
  Clock3,
  Dumbbell,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    label: 'Chính',
    items: [{ title: 'Trang chủ', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Vận hành',
    items: [
      { title: 'Đặt sân', href: '/bookings', icon: CalendarDays },
      { title: 'Thanh toán', href: '/payments', icon: Receipt },
      { title: 'Sân', href: '/fields', icon: MapPinned },
      { title: 'Cơ sở', href: '/venues', icon: Landmark },
    ],
  },
  {
    label: 'Danh mục',
    items: [
      { title: 'Bộ môn', href: '/sports', icon: Dumbbell },
      { title: 'Khung giờ', href: '/timeslots', icon: Clock3 },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { title: 'Báo cáo', href: '/reports', icon: ChartColumn },
      { title: 'Thông báo', href: '/notifications', icon: Bell },
      { title: 'Nhật ký', href: '/audit-logs', icon: ClipboardList },
      { title: 'Người dùng', href: '/users', icon: Users, roles: ['admin'] },
    ],
  },
];
