import { apiRequest } from '@/stores/api/api-request';
import { ICourtBlock } from '@/stores/api/types';

export type CourtBlocksResponse = {
  statusCode: number;
  message: string;
  data: ICourtBlock[];
};

export type CourtBlockResponse = {
  statusCode: number;
  message: string;
  data: ICourtBlock;
};

export const courtBlockService = {
  getByCourt: (courtId: string, params: { from: string; to: string }) =>
    apiRequest(`/courts/${courtId}/blocks`, { method: 'GET', params }),

  create: (courtId: string, body: { startAt: string; endAt: string; reason?: string }) =>
    apiRequest(`/courts/${courtId}/blocks`, {
      method: 'POST',
      body,
    }),

  remove: (id: string) => apiRequest(`/court-blocks/${id}`, { method: 'DELETE' }),
};
