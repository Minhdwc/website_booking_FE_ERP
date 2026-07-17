'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import { IReview } from '@/stores/api/types';
import { reviewService } from '@/stores/service/review.service';

export type ReviewListParams = {
  search?: string;
  page?: string;
  limit?: string;
};

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (params: ReviewListParams = {}) => [...reviewKeys.lists(), params] as const,
};

const fetchReviews = async (params?: ReviewListParams): Promise<IReview[]> => {
  const response = await reviewService.getReviews({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.page ? { page: params.page } : {}),
  });
  return unwrapList(response.data);
};

export const useReviews = (params?: ReviewListParams) =>
  useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => fetchReviews(params),
  });

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewService.deleteReview(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
};
