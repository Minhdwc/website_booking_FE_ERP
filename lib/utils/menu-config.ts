import { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  CalendarDays,
  Landmark,
  MapPinned,
  Clock3,
  Dumbbell,
  WalletCards,
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
      { title: 'Đặt sân', href: '/bookings', icon: CalendarDays, roles: ['staff'] },
      { title: 'Sân', href: '/fields', icon: MapPinned },
      { title: 'Cơ sở', href: '/venues', icon: Landmark },
    ],
  },
  {
    label: 'Danh mục',
    items: [
      { title: 'Bộ môn', href: '/sports', icon: Dumbbell },
      { title: 'Phương thức TT', href: '/payment-method', icon: WalletCards },
      { title: 'Khung giờ', href: '/timeslots', icon: Clock3 },
    ],
  },
];
