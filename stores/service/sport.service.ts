import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { ISport } from '@/stores/api/types';

export interface SportDetailResponse {
  status: string;
  message: string;
  data: ISport;
}

export interface SportsResponse {
  status: string;
  message: string;
  data: Response<ISport>;
}

export const sportService = {
  getSports: async (params?: { search?: string; page?: string; limit?: string }) => {
    const response = await apiRequest('/sports', { method: 'GET', params });
    return response;
  },

  getSport: async (id: string) => {
    const response = await apiRequest(`/sports/${id}`, { method: 'GET' });
    return response;
  },

  createSport: async (body: { name: string }) => {
    const response = await apiRequest('/sports', {
      method: 'POST',
      body,
    });
    return response;
  },

  updateSport: async (id: string, body: { name?: string }) => {
    const response = await apiRequest(`/sports/${id}`, {
      method: 'PATCH',
      body,
    });
    return response;
  },

  deleteSport: async (id: string) => {
    const response = await apiRequest(`/sports/${id}`, { method: 'DELETE' });
    return response;
  },
};
