import { apiRequest } from '@/stores/api/api-request';
import { IVenue } from '@/stores/api/types';

export interface VenueResponse {
  status: number;
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
  status: number;
  message: string;
  data: IVenue;
}

export interface VenuesResponse {
  status: number;
  message: string;
  data: IVenue[];
}

export const venueService = {
  getVenues: (params?: Record<string, string>) =>
    apiRequest<VenuesResponse>('/venues', { method: 'GET', params }),

  getVenue: (id: string) => apiRequest<VenueDetailResponse>(`/venues/${id}`, { method: 'GET' }),

  createVenue: (body: Omit<IVenue, 'id' | 'createdAt' | 'updatedAt' | 'fields'>) =>
    apiRequest<VenueDetailResponse>('/venues', { method: 'POST', body }),

  updateVenue: (id: string, body: Partial<IVenue>) =>
    apiRequest<VenueDetailResponse>(`/venues/${id}`, {
      method: 'PATCH',
      body,
    }),

  deleteVenue: (id: string) => apiRequest(`/venues/${id}`, { method: 'DELETE' }),
};
