import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { ITimeslot } from '@/stores/api/types';

export interface TimeslotDetailResponse {
  status: number;
  message: string;
  data: ITimeslot;
}

export interface TimeslotsResponse {
  status: number;
  message: string;
  data: Response<ITimeslot>;
}

export const timeslotService = {
  getTimeslots: (params?: { page?: string; limit?: string }) =>
    apiRequest<TimeslotsResponse>('/timeslots', { method: 'GET', params }),

  getTimeslot: (id: string) =>
    apiRequest<TimeslotDetailResponse>(`/timeslots/${id}`, { method: 'GET' }),

  createTimeslot: (body: Omit<ITimeslot, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<TimeslotDetailResponse>('/timeslots', { method: 'POST', body }),

  updateTimeslot: (id: string, body: Partial<ITimeslot>) =>
    apiRequest<TimeslotDetailResponse>(`/timeslots/${id}`, { method: 'PATCH', body }),

  deleteTimeslot: (id: string) => apiRequest(`/timeslots/${id}`, { method: 'DELETE' }),
};
