'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ISport } from '@/stores/api/types';
import { sportService } from '@/stores/service/sport.service';

export const sportKeys = {
  all: ['sports'] as const,
  lists: () => [...sportKeys.all, 'list'] as const,
  list: () => [...sportKeys.lists()] as const,
  details: () => [...sportKeys.all, 'detail'] as const,
  detail: (id: string) => [...sportKeys.details(), id] as const,
};

const fetchSports = async (): Promise<ISport[]> => {
  const response = await sportService.getSports();
  return response.data;
};

export const useSports = () =>
  useQuery({
    queryKey: sportKeys.list(),
    queryFn: fetchSports,
  });

export const useCreateSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Omit<ISport, 'id' | 'createdAt' | 'updatedAt'>) =>
      sportService.createSport(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
    },
  });
};
