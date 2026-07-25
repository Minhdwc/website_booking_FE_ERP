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
  description?: string;
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
      { title: 'Trang chủ', href: '/dashboard', icon: LayoutDashboard, roles: ['owner'], description: 'Tổng quan đặt sân và doanh thu' },
      {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        roles: ['admin'],
        description: 'Ticket hỗ trợ và báo cáo hệ thống',
      },
      { title: 'Báo cáo', href: '/reports', icon: BarChart3, roles: ['owner'], description: 'Doanh thu và lượt đặt' },
      { title: 'Báo cáo hệ thống', href: '/admin/reports', icon: BarChart3, roles: ['admin'], description: 'Thống kê toàn nền tảng' },
      { title: 'Phân tích', href: '/analytics', icon: LineChart, roles: ['admin'], description: 'Xu hướng và chỉ số' },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      { title: 'Lịch sân', href: '/calendar', icon: CalendarRange, roles: ['owner'], description: 'Lịch tuần hiện tại' },
      { title: 'Đặt sân', href: '/bookings', icon: CalendarDays, roles: ['owner'], description: 'Giữ chỗ và xác nhận đơn' },
      { title: 'Chat', href: '/chat', icon: MessageCircle, roles: ['admin', 'owner'], description: 'Tin nhắn khách hàng' },
      { title: 'Sân', href: '/courts', icon: MapPinned, roles: ['owner'], description: 'Quản lý danh sách sân' },
      { title: 'Khách hàng', href: '/customers', icon: UserRound, roles: ['owner'], description: 'Danh sách khách đặt sân' },
      { title: 'Cơ sở', href: '/venues', icon: Landmark, roles: ['owner'], description: 'Thông tin cơ sở thể thao' },
      { title: 'Đánh giá', href: '/reviews', icon: Star, roles: ['owner'], description: 'Phản hồi từ khách' },
    ],
  },
  {
    label: 'Quản trị',
    items: [
      { title: 'Hỗ trợ', href: '/admin/tickets', icon: LifeBuoy, roles: ['admin'], description: 'Ticket hệ thống' },
    ],
  },
  {
    label: 'Danh mục',
    items: [
      { title: 'Bộ môn', href: '/sports', icon: Dumbbell, description: 'Danh mục bộ môn' },
      { title: 'Phương thức TT', href: '/payment-method', icon: WalletCards, description: 'Cấu hình thanh toán' },
      { title: 'Tài khoản', href: '/users', icon: Users, roles: ['admin'], description: 'Quản lý người dùng' },
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
