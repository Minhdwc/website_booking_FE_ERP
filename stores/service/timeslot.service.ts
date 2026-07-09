import { apiRequest } from '@/stores/api/api-request';
import { ITimeslot } from '@/stores/api/types';

export interface TimeslotResponse {
  status: string;
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
  status: string;
  message: string;
  data: ITimeslot;
}

export interface TimeslotsResponse {
  status: string;
  message: string;
  data: ITimeslot[];
}

export const timeslotService = {
  getTimeslots: async () => {
    const response = await apiRequest('/timeslots', { method: 'GET' });
    return response;
  },

  getTimeslot: async (id: string) => {
    const response = await apiRequest(`/timeslots/${id}`, { method: 'GET' });
    return response;
  },

  createTimeslot: async (body: { startTime: string; endTime: string }) => {
    const response = await apiRequest('/timeslots', { method: 'POST', body });
    return response;
  },

  updateTimeslot: async (id: string, body: { startTime?: string; endTime?: string }) => {
    const response = await apiRequest(`/timeslots/${id}`, { method: 'PUT', body });
    return response;
  },

  deleteTimeslot: async (id: string) => {
    const response = await apiRequest(`/timeslots/${id}`, { method: 'DELETE' });
    return response;
  },
};
