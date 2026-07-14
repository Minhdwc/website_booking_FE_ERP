'use client';

import { useQuery } from '@tanstack/react-query';

import type { ITimeslot } from '@/stores/api/types';
import { timeslotService } from '@/stores/service/timeslot.service';

export const timeslotKeys = {
  all: ['timeslots'] as const,
  lists: () => [...timeslotKeys.all, 'list'] as const,
  list: () => [...timeslotKeys.lists()] as const,
};

const fetchTimeslots = async (): Promise<ITimeslot[]> => {
  const response = await timeslotService.getTimeslots();
  return response.data;
};

export const useTimeslots = () =>
  useQuery({
    queryKey: timeslotKeys.list(),
    queryFn: fetchTimeslots,
  });
