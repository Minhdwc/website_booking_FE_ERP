import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { IVenue, IVenueImage } from '@/stores/api/types';

export interface VenueDetailResponse {
  status: string;
  message: string;
  data: IVenue;
}

export interface VenuesResponse {
  status: string;
  message: string;
  data: Response<IVenue>;
}

export interface VenueImageResponse {
  status: string;
  message: string;
  data: IVenueImage;
}

export const venueService = {
  getVenues: async (params?: { search?: string; page?: string; limit?: string }) => {
    const response = await apiRequest('/venues', { method: 'GET', params });
    return response;
  },

  getVenue: async (id: string) => {
    const response = await apiRequest(`/venues/${id}`, { method: 'GET' });
    return response;
  },

  createVenue: async (body: {
    name: string;
    location: string;
    longitude: number;
    latitude: number;
    openTime: string;
    closeTime: string;
    restStartTime?: string;
    restEndTime?: string;
    description?: string;
    images?: string[];
    ownerId?: string;
  }) => {
    const response = await apiRequest('/venues', {
      method: 'POST',
      body,
    });
    return response;
  },

  updateVenue: async (id: string, body: Partial<IVenue> & { images?: string[] }) => {
    const response = await apiRequest(`/venues/${id}`, {
      method: 'PATCH',
      body,
    });
    return response;
  },

  deleteVenue: async (id: string) => {
    const response = await apiRequest(`/venues/${id}`, { method: 'DELETE' });
    return response;
  },

  uploadVenueImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiRequest(`/venues/${id}/images`, {
      method: 'POST',
      formData,
    });
    return response;
  },

  deleteVenueImage: async (venueId: string, imageId: string) => {
    const response = await apiRequest(`/venues/${venueId}/images/${imageId}`, {
      method: 'DELETE',
    });
    return response;
  },

  listVenueOwners: (venueId: string) =>
    apiRequest(`/venues/${venueId}/owners`, { method: 'GET' }),

  addVenueOwner: (venueId: string, userId: string) =>
    apiRequest(`/venues/${venueId}/owners`, { method: 'POST', body: { userId } }),

  removeVenueOwner: (venueId: string, userId: string) =>
    apiRequest(`/venues/${venueId}/owners/${userId}`, { method: 'DELETE' }),
};
