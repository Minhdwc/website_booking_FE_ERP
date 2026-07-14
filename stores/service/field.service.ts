import { apiRequest } from '@/stores/api/api-request';
import { IField } from '@/stores/api/types';

export interface FieldResponse {
  status: number;
  message: string;
  data: FieldPage;
}

export interface FieldPage {
  page: number;
  limit: number;
  total: number;
  data: IField[];
}

export interface FieldDetailResponse {
  status: number;
  message: string;
  data: IField;
}

export interface FieldsResponse {
  status: number;
  message: string;
  data: IField[];
}

export const fieldService = {
  getFields: (params?: any) => apiRequest<FieldsResponse>('/fields', { method: 'GET', params }),

  getField: (id: string) => apiRequest<FieldDetailResponse>(`/fields/${id}`, { method: 'GET' }),

  createField: (body: Omit<IField, 'id' | 'createdAt' | 'updatedAt' | 'sport' | 'venue'>) =>
    apiRequest<FieldDetailResponse>('/fields', { method: 'POST', body }),

  updateField: (id: string, body: Partial<IField>) =>
    apiRequest<FieldDetailResponse>(`/fields/${id}`, {
      method: 'PATCH',
      body,
    }),

  deleteField: (id: string) => apiRequest(`/fields/${id}`, { method: 'DELETE' }),
};
