import { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  CalendarDays,
  Landmark,
  MapPinned,
  Dumbbell,
  WalletCards,
  BarChart3,
  LineChart,
  MessageCircle,
  Star,
  Users,
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
    items: [
      { title: 'Trang chủ', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Báo cáo', href: '/reports', icon: BarChart3 },
      { title: 'Phân tích', href: '/analytics', icon: LineChart, roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      { title: 'Đặt sân', href: '/bookings', icon: CalendarDays, roles: ['staff'] },
      { title: 'Chat', href: '/chat', icon: MessageCircle, roles: ['admin', 'staff'] },
      { title: 'Sân', href: '/fields', icon: MapPinned },
      { title: 'Cơ sở', href: '/venues', icon: Landmark },
      { title: 'Đánh giá', href: '/reviews', icon: Star },
    ],
  },
  {
    label: 'Danh mục',
    items: [
      { title: 'Bộ môn', href: '/sports', icon: Dumbbell },
      { title: 'Phương thức TT', href: '/payment-method', icon: WalletCards },
      { title: 'Tài khoản', href: '/users', icon: Users, roles: ['admin'] },
    ],
  },
];
