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
  Clock,
  Tags,
  UserRound,
  ShieldCheck,
  LifeBuoy,
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
      { title: 'Trang chủ', href: '/dashboard', icon: LayoutDashboard, roles: ['owner'] },
      {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        roles: ['admin'],
      },
      { title: 'Báo cáo', href: '/reports', icon: BarChart3, roles: ['owner'] },
      { title: 'Báo cáo hệ thống', href: '/admin/reports', icon: BarChart3, roles: ['admin'] },
      { title: 'Phân tích', href: '/analytics', icon: LineChart, roles: ['admin'] },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      { title: 'Lịch sân', href: '/calendar', icon: CalendarRange, roles: ['owner'] },
      { title: 'Đặt sân', href: '/bookings', icon: CalendarDays, roles: ['owner'] },
      { title: 'Chat', href: '/chat', icon: MessageCircle, roles: ['admin', 'owner'] },
      { title: 'Sân', href: '/courts', icon: MapPinned, roles: ['owner'] },
      { title: 'Khách hàng', href: '/customers', icon: UserRound, roles: ['owner'] },
      { title: 'Cơ sở', href: '/venues', icon: Landmark, roles: ['owner'] },
      { title: 'Đánh giá', href: '/reviews', icon: Star, roles: ['owner'] },
    ],
  },
  // {
  //   label: 'Quản trị',
  //   items: [
  //     { title: 'Duyệt chủ sân', href: '/admin/owners', icon: ShieldCheck, roles: ['admin'] },
  //     { title: 'Hỗ trợ', href: '/admin/tickets', icon: LifeBuoy, roles: ['admin'] },
  //   ],
  // },
  {
    label: 'Danh mục',
    items: [
      { title: 'Bộ môn', href: '/sports', icon: Dumbbell },
      { title: 'Phương thức TT', href: '/payment-method', icon: WalletCards },
      { title: 'Tài khoản', href: '/users', icon: Users, roles: ['admin'] },
    ],
  },
  // {
  //   label: 'Chủ sân',
  //   items: [
  //     {
  //       title: 'Đăng ký chủ sân',
  //       href: '/owner/register',
  //       icon: ShieldCheck,
  //       roles: ['owner'],
  //     },
  //     {
  //       title: 'Trạng thái duyệt',
  //       href: '/owner/pending',
  //       icon: Clock,
  //       roles: ['owner'],
  //     },
  //   ],
  // },
];
