'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import { IBooking } from '@/stores/api/types';
import {
  bookingService,
  type BookingDetailResponse,
  type BookingResponse,
} from '@/stores/service/booking.service';

import { bookingKeys, type BookingListParams } from './keys';

const fetchBookings = async (params?: BookingListParams): Promise<IBooking[]> => {
  const response = (await bookingService.getBookings({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.page ? { page: params.page } : {}),
  })) as BookingResponse;
  return unwrapList(response.data) as IBooking[];
};

const fetchBooking = async (id: string): Promise<IBooking> => {
  const response = (await bookingService.getBooking(id)) as BookingDetailResponse;
  return response.data;
};

export const useBookings = (params?: BookingListParams) =>
  useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => fetchBookings(params),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

export const useBooking = (id: string) =>
  useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => fetchBooking(id),
    enabled: Boolean(id),
  });

const getPendingBookings = (bookings: IBooking[]) =>
  bookings
    .filter((booking) => booking.status === 'waiting_payment')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

/** Derived view of pending bookings from the shared bookings query. */
export const usePendingBookings = (limit = 5) => {
  const { data: bookings = [], isLoading } = useBookings({ limit: '100' });
  const allPending = getPendingBookings(bookings);

  return {
    pendingBookings: allPending.slice(0, limit),
    pendingCount: allPending.length,
    isLoading,
  };
};
