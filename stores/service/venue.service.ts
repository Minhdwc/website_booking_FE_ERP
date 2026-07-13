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

  createVenue: (body: {
    name: string;
    location: string;
    longitude: number;
    latitude: number;
    openTime: string;
    closeTime: string;
    restStartTime?: string;
    restEndTime?: string;
    description?: string;
    ownerId?: string;
  }) => apiRequest<VenueDetailResponse>('/venues', { method: 'POST', body }),

  updateVenue: (id: string, body: { value: IVenue }) =>
    apiRequest<VenueDetailResponse>(`/venues/${id}`, {
      method: 'PUT',
      body: { value: body.value },
    }),

  deleteVenue: (id: string) => apiRequest(`/venues/${id}`, { method: 'DELETE' }),
};
