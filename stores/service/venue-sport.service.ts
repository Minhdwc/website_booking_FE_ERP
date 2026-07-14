import { apiRequest } from '@/stores/api/api-request';
import { IVenueSport } from '@/stores/api/types';

export interface VenueSportDetailResponse {
  status: string;
  message: string;
  data: IVenueSport;
}

export interface VenueSportsResponse {
  status: string;
  message: string;
  data: IVenueSport[];
}

export const venueSportService = {
  getVenueSports: async (params?: { venueId?: string }) => {
    const response = await apiRequest('/venue-sports', {
      method: 'GET',
      params,
    });
    return response;
  },

  getVenueSport: async (id: string) => {
    const response = await apiRequest(`/venue-sports/${id}`, {
      method: 'GET',
    });
    return response;
  },

  createVenueSport: async (body: {
    venueId: string;
    sportId: string;
    description?: string;
    isActive?: boolean;
  }) => {
    const response = await apiRequest('/venue-sports', {
      method: 'POST',
      body,
    });
    return response;
  },

  updateVenueSport: async (
    id: string,
    body: { description?: string | null; isActive?: boolean },
  ) => {
    const response = await apiRequest(`/venue-sports/${id}`, {
      method: 'PATCH',
      body,
    });
    return response;
  },

  deleteVenueSport: async (id: string) => {
    const response = await apiRequest(`/venue-sports/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};
