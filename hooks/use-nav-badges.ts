'use client';

import type { NavBadgeCounts } from '@/components/layout/nav-config';

export function useNavBadges(): NavBadgeCounts {
  return {
    pendingBookings: 0,
    overduePayments: 0,
  };
}
