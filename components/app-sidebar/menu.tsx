'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoMain from '@/assets/logo/logo-16-9.png';
import {
  Banknote,
  Bell,
  CalendarClock,
  Clock,
  Dumbbell,
  House,
  MapPin,
  MessageSquareText,
  Trophy,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@mantine/core';

const menu = [
  { name: 'Dashboard', path: '/dashboard', icon: House },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Sports', path: '/sports', icon: Trophy },
  { name: 'Venues', path: '/venues', icon: MapPin },
  { name: 'Fields', path: '/fields', icon: Dumbbell },
  { name: 'Timeslots', path: '/timeslots', icon: Clock },
  { name: 'Bookings', path: '/bookings', icon: CalendarClock },
  { name: 'Payments', path: '/payments', icon: Banknote },
  { name: 'Reviews', path: '/reviews', icon: MessageSquareText },
  { name: 'Notifications', path: '/notifications', icon: Bell, badge: 3 },
];

export default function AppSidebarMenu() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div className="flex flex-col gap-1">
      {/* Logo */}
      <div className="mb-6 px-2">
        <Link href="/" className="block">
          <Image
            src={LogoMain}
            alt="FieldOps"
            className="h-32 w-auto object-contain"
            loading="eager"
          />
        </Link>
      </div>

      {/* Label */}
      <p
        className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: 'var(--mantine-color-dimmed)' }}
      >
        Main Menu
      </p>

      {/* Nav items */}
      {menu.map((item) => {
        const active = isActive(item.path);
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            href={item.path}
            className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
            style={
              active
                ? {
                    backgroundColor: 'var(--mantine-color-teal-6)',
                    color: '#fff',
                    boxShadow:
                      '0 2px 8px color-mix(in srgb, var(--mantine-color-teal-6) 40%, transparent)',
                  }
                : {
                    color: 'var(--mantine-color-text)',
                  }
            }
            // Hover xử lý bằng CSS vì Tailwind không biết Mantine variables
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'var(--mantine-color-default-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {/* Active indicator bar */}
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-white/50" />
            )}

            <Icon
              className={[
                'h-[18px] w-[18px] shrink-0 transition-transform duration-200',
                active ? 'text-white' : 'group-hover:scale-110',
              ].join(' ')}
              style={active ? {} : { color: 'var(--mantine-color-dimmed)' }}
            />

            <span className="flex-1 truncate">{item.name}</span>

            {item.badge && !active && (
              <Badge size="sm" color="red" variant="light">
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </div>
  );
}
