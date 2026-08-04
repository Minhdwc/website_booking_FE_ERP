'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sportService } from '@/stores/service/sport.service';

import { sportKeys } from './keys';

export const useCreateSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { name: string }) => sportService.createSport(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
    },
  });
};

export const useUpdateSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name?: string } }) =>
      sportService.updateSport(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sportKeys.detail(variables.id) });
    },
  });
};

export const useDeleteSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sportService.deleteSport(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
      queryClient.removeQueries({ queryKey: sportKeys.detail(id) });
    },
  });
};
