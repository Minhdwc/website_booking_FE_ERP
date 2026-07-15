import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { IReview } from '@/stores/api/types';

export interface ReviewResponse {
  status: string;
  message: string;
  data: Response<IReview>;
}

export interface ReviewDetailResponse {
  status: string;
  message: string;
  data: IReview;
}

export const reviewService = {
  getReviews: async (params?: { search?: string; page?: string; limit?: string }) => {
    const response = await apiRequest('/reviews', { method: 'GET', params });
    return response;
  },

  getReview: async (id: string) => {
    const response = await apiRequest(`/reviews/${id}`, { method: 'GET' });
    return response;
  },

  createReview: async (body: {
    userId: string;
    fieldId: string;
    rating: number;
    comment?: string;
  }) => {
    const response = await apiRequest('/reviews', { method: 'POST', body });
    return response;
  },

  updateReview: async (id: string, body: { value: IReview }) => {
    const response = await apiRequest(`/reviews/${id}`, {
      method: 'PUT',
      body: { value: body.value },
    });
    return response;
  },

  deleteReview: async (id: string) => {
    const response = await apiRequest(`/reviews/${id}`, { method: 'DELETE' });
    return response;
  },
};
