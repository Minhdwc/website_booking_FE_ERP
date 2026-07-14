import { apiRequest } from '@/stores/api/api-request';
import { IField, IFieldImage } from '@/stores/api/types';

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

export interface FieldImageResponse {
  status: string;
  message: string;
  data: IFieldImage;
}

export const fieldService = {
  getFields: async (params?: any) => {
    const response = await apiRequest('/fields', { method: 'GET', params });
    return response;
  },

  getField: async (id: string) => {
    const response = await apiRequest(`/fields/${id}`, { method: 'GET' });
    return response;
  },

  createField: async (body: {
    name: string;
    description?: string;
    price: number;
    minDurationMinutes: number;
    durationStepMinutes: number;
    status?: IField['status'];
    sportId: string;
    venueId: string;
    images?: string[];
  }) => {
    const response = await apiRequest('/fields', {
      method: 'POST',
      body,
    });
    return response;
  },

  updateField: async (id: string, body: Partial<IField> & { images?: string[] }) => {
    const response = await apiRequest(`/fields/${id}`, {
      method: 'PATCH',
      body,
    });
    return response;
  },

  deleteField: async (id: string) => {
    const response = await apiRequest(`/fields/${id}`, { method: 'DELETE' });
    return response;
  },

  uploadFieldImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiRequest(`/fields/${id}/images`, {
      method: 'POST',
      formData,
    });
    return response;
  },

  deleteFieldImage: async (fieldId: string, imageId: string) => {
    const response = await apiRequest(`/fields/${fieldId}/images/${imageId}`, {
      method: 'DELETE',
    });
    return response;
  },
};
