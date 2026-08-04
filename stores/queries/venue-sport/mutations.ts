'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { venueSportService } from '@/stores/service/venue-sport.service';

import { venueSportKeys } from './keys';

export const useCreateVenueSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof venueSportService.createVenueSport>[0]) =>
      venueSportService.createVenueSport(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueSportKeys.lists() });
    },
  });
};

export const useUpdateVenueSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof venueSportService.updateVenueSport>[1];
    }) => venueSportService.updateVenueSport(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venueSportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: venueSportKeys.detail(variables.id) });
    },
  });
};

export const useDeleteVenueSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => venueSportService.deleteVenueSport(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: venueSportKeys.lists() });
      queryClient.removeQueries({ queryKey: venueSportKeys.detail(id) });
    },
  });
};
