'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import { ITimeslot } from '@/stores/api/types';
import { timeslotService } from '@/stores/service/timeslot.service';

export type TimeslotListParams = {
  page?: string;
  limit?: string;
};

export const timeslotKeys = {
  all: ['timeslots'] as const,
  lists: () => [...timeslotKeys.all, 'list'] as const,
  list: (params: TimeslotListParams = {}) => [...timeslotKeys.lists(), params] as const,
};

const fetchTimeslots = async (params?: TimeslotListParams): Promise<ITimeslot[]> => {
  const response = await timeslotService.getTimeslots({
    limit: params?.limit ?? '100',
    ...(params?.page ? { page: params.page } : {}),
  });
  return unwrapList(response.data);
};

export const useTimeslots = (params?: TimeslotListParams) =>
  useQuery({
    queryKey: timeslotKeys.list(params),
    queryFn: () => fetchTimeslots(params),
  });

export const useCreateTimeslot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { startTime: string; endTime: string }) =>
      timeslotService.createTimeslot(body as Omit<ITimeslot, 'id' | 'createdAt' | 'updatedAt'>),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: timeslotKeys.lists() });
    },
  });
};

export const useUpdateTimeslot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { startTime?: string; endTime?: string } }) =>
      timeslotService.updateTimeslot(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: timeslotKeys.lists() });
    },
  });
};

export const useDeleteTimeslot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeslotService.deleteTimeslot(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: timeslotKeys.lists() });
    },
  });
};
