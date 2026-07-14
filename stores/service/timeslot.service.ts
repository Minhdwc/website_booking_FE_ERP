import { apiRequest } from '@/stores/api/api-request';
import { ITimeslot } from '@/stores/api/types';

export interface TimeslotResponse {
  status: number;
  message: string;
  data: TimeslotPage;
}

export interface TimeslotPage {
  page: number;
  limit: number;
  total: number;
  data: ITimeslot[];
}

export interface TimeslotDetailResponse {
  status: number;
  message: string;
  data: ITimeslot;
}

export interface TimeslotsResponse {
  status: number;
  message: string;
  data: ITimeslot[];
}

export const timeslotService = {
  getTimeslots: () => apiRequest<TimeslotsResponse>('/timeslots', { method: 'GET' }),

  getTimeslot: (id: string) =>
    apiRequest<TimeslotDetailResponse>(`/timeslots/${id}`, { method: 'GET' }),

  createTimeslot: (body: Omit<ITimeslot, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<TimeslotDetailResponse>('/timeslots', { method: 'POST', body }),

  updateTimeslot: (id: string, body: Partial<ITimeslot>) =>
    apiRequest<TimeslotDetailResponse>(`/timeslots/${id}`, { method: 'PATCH', body }),

  deleteTimeslot: (id: string) => apiRequest(`/timeslots/${id}`, { method: 'DELETE' }),
};
