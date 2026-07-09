'use client';

import { useQuery } from '@tanstack/react-query';
import type { NavBadgeCounts } from './nav-config';
import { api } from '@/lib/api';

/**
 * Single source of truth for the numbers shown as sidebar badges.
 * Replace the endpoints below with the real ones; keep the shape.
 * These are the only two counts allowed on the sidebar — both drive
 * a real next action (xác nhận đặt sân / thu công nợ), so they
 * satisfy the "no decorative numbers" rule.
 */
export function useNavBadges(): NavBadgeCounts {
  const { data: pendingBookings = 0 } = useQuery({
    queryKey: ['nav-badge', 'pending-bookings'],
    queryFn: () => api.get<number>('/dat-san/cho-xac-nhan/count'),
    staleTime: 30_000,
  });

  const { data: overduePayments = 0 } = useQuery({
    queryKey: ['nav-badge', 'overdue-payments'],
    queryFn: () => api.get<number>('/hoa-don/cong-no/count'),
    staleTime: 60_000,
  });

  return { pendingBookings, overduePayments };
}
