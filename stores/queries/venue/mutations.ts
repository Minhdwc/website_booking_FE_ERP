'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { venueService } from '@/stores/service/venue.service';

import { venueKeys } from './keys';

export const useCreateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof venueService.createVenue>[0]) =>
      venueService.createVenue(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof venueService.updateVenue>[1];
    }) => venueService.updateVenue(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(variables.id) });
    },
  });
};

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => venueService.deleteVenue(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
      queryClient.removeQueries({ queryKey: venueKeys.detail(id) });
    },
  });
};

export const useUploadVenueImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ venueId, file }: { venueId: string; file: File }) =>
      venueService.uploadVenueImage(venueId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(variables.venueId) });
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};

export const useDeleteVenueImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ venueId, imageId }: { venueId: string; imageId: string }) =>
      venueService.deleteVenueImage(venueId, imageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(variables.venueId) });
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};

export const useSetVenueImageThumbnail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ venueId, imageId }: { venueId: string; imageId: string }) =>
      venueService.setVenueImageThumbnail(venueId, imageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(variables.venueId) });
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};
