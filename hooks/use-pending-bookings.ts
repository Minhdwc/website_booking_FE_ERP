'use client';

import { useMemo } from 'react';

import { useBooking } from '@/context/booking.context';

export const usePendingBookings = (limit = 5) => {
  const { bookings, pendingCount, isLoading } = useBooking();

  const pendingBookings = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status === 'pending')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit),
    [bookings, limit],
  );

  return { pendingBookings, pendingCount, isLoading };
};
