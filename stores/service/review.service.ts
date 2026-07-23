import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { IReview } from '@/stores/api/types';

export interface ReviewsResponse {
  statusCode: number;
  message: string;
  data: Response<IReview> | IReview[];
}

export interface ReviewDetailResponse {
  statusCode: number;
  message: string;
  data: IReview;
}

export const reviewService = {
  getReviews: (params?: { search?: string; page?: string; limit?: string }) =>
    apiRequest<ReviewsResponse>('/reviews', { method: 'GET', params }),

  getReview: (id: string) => apiRequest<ReviewDetailResponse>(`/reviews/${id}`, { method: 'GET' }),

  deleteReview: (id: string) => apiRequest(`/reviews/${id}`, { method: 'DELETE' }),
};
