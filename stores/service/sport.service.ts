import { apiRequest } from '@/stores/api/api-request';
import { ISport } from '@/stores/api/types';

export interface SportResponse {
  status: number;
  message: string;
  data: SportPage;
}

export interface SportPage {
  page: number;
  limit: number;
  total: number;
  data: ISport[];
}

export interface SportDetailResponse {
  status: number;
  message: string;
  data: ISport;
}

export interface SportsResponse {
  status: number;
  message: string;
  data: ISport[];
}

export const sportService = {
  getSports: () => apiRequest<SportsResponse>('/sports', { method: 'GET' }),

  getSport: (id: string) => apiRequest<SportDetailResponse>(`/sports/${id}`, { method: 'GET' }),

  createSport: (body: Omit<ISport, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<SportDetailResponse>('/sports', { method: 'POST', body }),

  updateSport: (id: string, body: Partial<ISport>) =>
    apiRequest<SportDetailResponse>(`/sports/${id}`, { method: 'PATCH', body }),

  deleteSport: (id: string) => apiRequest(`/sports/${id}`, { method: 'DELETE' }),
};
