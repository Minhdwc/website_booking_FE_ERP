'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { courtService } from '@/stores/service/court.service';

import { courtKeys } from './keys';

export const useCreateCourt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof courtService.createCourt>[0]) =>
      courtService.createCourt(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
    },
  });
};

export const useUpdateCourt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof courtService.updateCourt>[1];
    }) => courtService.updateCourt(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courtKeys.detail(variables.id) });
    },
  });
};

export const useDeleteCourt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courtService.deleteCourt(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
      queryClient.removeQueries({ queryKey: courtKeys.detail(id) });
    },
  });
};

export const useUploadCourtImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courtId, file }: { courtId: string; file: File }) =>
      courtService.uploadCourtImage(courtId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courtKeys.detail(variables.courtId) });
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
    },
  });
};

export const useDeleteCourtImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courtId, imageId }: { courtId: string; imageId: string }) =>
      courtService.deleteCourtImage(courtId, imageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courtKeys.detail(variables.courtId) });
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
    },
  });
};
