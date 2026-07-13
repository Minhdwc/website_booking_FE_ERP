import { apiRequest } from '@/stores/api/api-request';
import { IField } from '@/stores/api/types';

export interface FieldResponse {
  status: string;
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
  status: string;
  message: string;
  data: IField;
}

export interface FieldsResponse {
  status: string;
  message: string;
  data: IField[];
}

export const fieldService = {
  getFields: async () => {
    const response = await apiRequest('/fields', { method: 'GET' });
    return response;
  },

  getField: async (id: string) => {
    const response = await apiRequest(`/fields/${id}`, { method: 'GET' });
    return response;
  },

  createField: async (body: {
    name: string;
    price: number;
    sportId: string;
    venueId: string;
    description?: string;
    status?: string;
    images?: string[];
  }) => {
    const response = await apiRequest('/fields', { method: 'POST', body });
    return response;
  },

  updateField: async (id: string, body: { value: IField }) => {
    const response = await apiRequest(`/fields/${id}`, {
      method: 'PUT',
      body: { value: body.value },
    });
    return response;
  },

  deleteField: async (id: string) => {
    const response = await apiRequest(`/fields/${id}`, { method: 'DELETE' });
    return response;
  },
};
