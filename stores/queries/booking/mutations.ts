'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IBooking } from '@/stores/api/types';
import { bookingService } from '@/stores/service/booking.service';

import { bookingKeys } from './keys';

export const useCreateWalkInBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof bookingService.createWalkIn>[0]) =>
      bookingService.createWalkIn(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      items: {
        courtId: string;
        date: string;
        startTime: string;
        endTime: string;
      }[];
      note?: string;
    }) => bookingService.createBooking(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { status: IBooking['status']; reason?: string };
    }) => bookingService.updateBooking(id, body),
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
