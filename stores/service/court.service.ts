import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { ICourt, ICourtAvailability, ICourtImage } from '@/stores/api/types';

export interface CourtDetailResponse {
  status: string;
  message: string;
  data: ICourt;
}

export interface CourtsResponse {
  status: string;
  message: string;
  data: Response<ICourt>;
}

export interface CourtImageResponse {
  status: string;
  message: string;
  data: ICourtImage;
}

export interface CourtAvailabilityResponse {
  status: string;
  message: string;
  data: ICourtAvailability;
}

export const courtService = {
  getCourts: async (params?: {
    search?: string;
    venueId?: string;
    page?: string;
    limit?: string;
  }) => {
    const response = await apiRequest('/courts', { method: 'GET', params });
    return response;
  },

  getCourt: async (id: string) => {
    const response = await apiRequest(`/courts/${id}`, { method: 'GET' });
    return response;
  },

  getAvailability: async (id: string, date: string) => {
    const response = await apiRequest(`/courts/${id}/availability`, {
      method: 'GET',
      params: { date },
    });
    return response;
  },

  createCourt: async (body: {
    name: string;
    description?: string;
    basePriceVnd: number;
    minDurationMinutes: number;
    durationStepMinutes: number;
    status?: ICourt['status'];
    sportId: string;
    venueId: string;
    images?: string[];
  }) => {
    const response = await apiRequest('/courts', {
      method: 'POST',
      body,
    });
    return response;
  },

  updateCourt: async (id: string, body: Partial<ICourt> & { images?: string[] }) => {
    const response = await apiRequest(`/courts/${id}`, {
      method: 'PATCH',
      body,
    });
    return response;
  },

  deleteCourt: async (id: string) => {
    const response = await apiRequest(`/courts/${id}`, { method: 'DELETE' });
    return response;
  },

  uploadCourtImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiRequest(`/courts/${id}/images`, {
      method: 'POST',
      formData,
    });
    return response;
  },

  deleteCourtImage: async (courtId: string, imageId: string) => {
    const response = await apiRequest(`/courts/${courtId}/images/${imageId}`, {
      method: 'DELETE',
    });
    return response;
  },
};
