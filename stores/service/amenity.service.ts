import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { IAmenity } from '@/stores/api/types';

export interface AmenityDetailResponse {
  status: string;
  message: string;
  data: IAmenity;
}

export interface AmenitiesResponse {
  status: string;
  message: string;
  data: Response<IAmenity>;
}

export const amenityService = {
  getAmenities: async (params?: { search?: string; page?: string; limit?: string }) => {
    const response = await apiRequest('/amenities', { method: 'GET', params });
    return response;
  },

  getAmenity: async (id: string) => {
    const response = await apiRequest(`/amenities/${id}`, { method: 'GET' });
    return response;
  },

  createAmenity: async (body: { name: string; description?: string }) => {
    const response = await apiRequest('/amenities', {
      method: 'POST',
      body,
    });
    return response;
  },

  updateAmenity: async (id: string, body: Partial<IAmenity>) => {
    const response = await apiRequest(`/amenities/${id}`, {
      method: 'PATCH',
      body,
    });
    return response;
  },

  deleteAmenity: async (id: string) => {
    const response = await apiRequest(`/amenities/${id}`, { method: 'DELETE' });
    return response;
  },
};
