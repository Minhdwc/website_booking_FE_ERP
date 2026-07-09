import { apiRequest } from '@/stores/api/api-request';
import { IVenue } from '@/stores/api/types';

export interface VenueResponse {
  status: string;
  message: string;
  data: VenuePage;
}

export interface VenuePage {
  page: number;
  limit: number;
  total: number;
  data: IVenue[];
}

export interface VenueDetailResponse {
  status: string;
  message: string;
  data: IVenue;
}

export interface VenuesResponse {
  status: string;
  message: string;
  data: IVenue[];
}

export const venueService = {
  getVenues: async (params?: Record<string, string>) => {
    const response = await apiRequest('/venues', { method: 'GET', params });
    return response;
  },

  getVenue: async (id: string) => {
    const response = await apiRequest(`/venues/${id}`, { method: 'GET' });
    return response;
  },

  createVenue: async (body: { name: string; location: string; description?: string }) => {
    const response = await apiRequest('/venues', { method: 'POST', body });
    return response;
  },

  updateVenue: async (id: string, body: { value: IVenue }) => {
    const response = await apiRequest(`/venues/${id}`, {
      method: 'PUT',
      body: { value: body.value },
    });
    return response;
  },

  deleteVenue: async (id: string) => {
    const response = await apiRequest(`/venues/${id}`, { method: 'DELETE' });
    return response;
  },
};
