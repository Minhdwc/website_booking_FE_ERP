'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { NavBadgeCounts } from '@/lib/utils/menu-config';
import type { BookingStatus, IBooking } from '@/stores/api/types';
import { bookingService, type BookingDetailResponse } from '@/stores/service/booking.service';

export const bookingKeys = {
  all: ['bookings'] as const,
  detail: (id: string) => ['bookings', id] as const,
};

type CreateBookingInput = {
  userId: string;
  fieldId: string;
  timeslotId: string;
  date: string;
  status?: BookingStatus;
};

type BookingContextValue = {
  bookings: IBooking[];
  isLoading: boolean;
  isError: boolean;
  pendingCount: number;
  badgeCounts: NavBadgeCounts;
  refetch: () => void;
  getBooking: (id: string) => Promise<IBooking>;
  createBooking: (body: CreateBookingInput) => Promise<BookingDetailResponse>;
  updateBooking: (id: string, value: IBooking) => Promise<BookingDetailResponse>;
  deleteBooking: (id: string) => Promise<BookingDetailResponse>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
};

const BookingContext = createContext<BookingContextValue | null>(null);

async function fetchBookings(): Promise<IBooking[]> {
  const response = await bookingService.getBookings();
  return response.data?.data || [];
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const listQuery = useQuery<IBooking[]>({
    queryKey: bookingKeys.all,
    queryFn: fetchBookings,
    refetchInterval: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: IBooking }) =>
      bookingService.updateBooking(id, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bookingService.deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });

  const bookings: IBooking[] = listQuery.data || [];

  const pendingCount = useMemo(
    () => bookings.filter((booking) => booking.status === 'pending').length,
    [bookings],
  );

  const badgeCounts = useMemo<NavBadgeCounts>(
    () => ({
      pendingBookings: pendingCount,
      overduePayments: 0,
    }),
    [pendingCount],
  );

  const getBooking = useCallback(async (id: string) => {
    const response = await bookingService.getBooking(id);
    return response.data;
  }, []);

  const value = useMemo<BookingContextValue>(
    () => ({
      bookings,
      isLoading: listQuery.isLoading,
      isError: listQuery.isError,
      pendingCount,
      badgeCounts,
      refetch: () => {
        void listQuery.refetch();
      },
      getBooking,
      createBooking: (body) => createMutation.mutateAsync(body),
      updateBooking: (id, value) => updateMutation.mutateAsync({ id, value }),
      deleteBooking: (id) => deleteMutation.mutateAsync(id),
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
    }),
    [
      bookings,
      listQuery,
      pendingCount,
      badgeCounts,
      getBooking,
      createMutation,
      updateMutation,
      deleteMutation,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking phải được dùng trong BookingProvider');
  }
  return context;
}
