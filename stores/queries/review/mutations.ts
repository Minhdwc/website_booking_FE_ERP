'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reviewService } from '@/stores/service/review.service';

import { reviewKeys } from './keys';

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewService.deleteReview(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
};
