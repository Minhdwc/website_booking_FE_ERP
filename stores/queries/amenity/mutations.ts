'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { amenityService } from '@/stores/service/amenity.service';

import { amenityKeys } from './keys';

export const useCreateAmenity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof amenityService.createAmenity>[0]) =>
      amenityService.createAmenity(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenityKeys.lists() });
    },
  });
};

export const useUpdateAmenity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof amenityService.updateAmenity>[1];
    }) => amenityService.updateAmenity(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: amenityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: amenityKeys.detail(variables.id) });
    },
  });
};

export const useDeleteAmenity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => amenityService.deleteAmenity(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: amenityKeys.lists() });
      queryClient.removeQueries({ queryKey: amenityKeys.detail(id) });
    },
  });
};
