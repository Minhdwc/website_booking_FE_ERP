'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { BookingStatus, IBooking } from '@/stores/api/types';
import { bookingService } from '@/stores/service/booking.service';

export type BookingListParams = {
  search?: string;
  page?: string;
  limit?: string;
};

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (params: BookingListParams = {}) => [...bookingKeys.lists(), params] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

const fetchBookings = async (): Promise<IBooking[]> => {
  const response = await bookingService.getBookings();
  const payload = response.data as IBooking[] | { data?: IBooking[] } | undefined;
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

const fetchBooking = async (id: string) => {
  const response = await bookingService.getBooking(id);
  return response.data;
};

export const useBookings = (params?: BookingListParams) =>
  useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: fetchBookings,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

export const useBooking = (id: string) =>
  useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => fetchBooking(id),
    enabled: Boolean(id),
  });

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      userId: string;
      fieldId: string;
      timeslotId: string;
      date: string;
      status?: BookingStatus;
    }) => bookingService.createBooking(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<IBooking> }) =>
      bookingService.updateBooking(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.deleteBooking(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.removeQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
};

const getPendingBookings = (bookings: IBooking[]) =>
  bookings
    .filter((booking) => booking.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

/** Derived view of pending bookings from the shared bookings query. */
export const usePendingBookings = (limit = 5) => {
  const { data: bookings = [], isLoading } = useBookings();
  const allPending = getPendingBookings(bookings);

  return {
    pendingBookings: allPending.slice(0, limit),
    pendingCount: allPending.length,
    isLoading,
  };
};
