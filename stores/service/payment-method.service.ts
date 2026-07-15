import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { IPaymentMethod } from '@/stores/api/types';

export interface PaymentMethodDetailResponse {
  status: string;
  message: string;
  data: IPaymentMethod;
}

export interface PaymentMethodsResponse {
  status: string;
  message: string;
  data: Response<IPaymentMethod>;
}

export const paymentMethodService = {
  getPaymentMethods: async (params?: { search?: string; page?: string; limit?: string }) => {
    const response = await apiRequest('/payment-methods', { method: 'GET', params });
    return response;
  },

  getPaymentMethod: async (id: string) => {
    const response = await apiRequest(`/payment-methods/${id}`, { method: 'GET' });
    return response;
  },

  createPaymentMethod: async (body: {
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
  }) => {
    const response = await apiRequest('/payment-methods', {
      method: 'POST',
      body,
    });
    return response;
  },

  updatePaymentMethod: async (
    id: string,
    body: { name?: string; description?: string | null; isActive?: boolean },
  ) => {
    const response = await apiRequest(`/payment-methods/${id}`, {
      method: 'PATCH',
      body,
    });
    return response;
  },

  deletePaymentMethod: async (id: string) => {
    const response = await apiRequest(`/payment-methods/${id}`, { method: 'DELETE' });
    return response;
  },
};
