import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { IUserPaymentMethod } from '@/stores/api/types';

export interface UserPaymentMethodDetailResponse {
  status: string;
  message: string;
  data: IUserPaymentMethod;
}

export interface UserPaymentMethodsResponse {
  status: string;
  message: string;
  data: Response<IUserPaymentMethod>;
}

export const userPaymentMethodService = {
  getUserPaymentMethods: async (params?: { page?: string; limit?: string }) => {
    const response = await apiRequest('/user-payment-methods', {
      method: 'GET',
      params,
    });
    return response;
  },

  getUserPaymentMethod: async (id: string) => {
    const response = await apiRequest(`/user-payment-methods/${id}`, {
      method: 'GET',
    });
    return response;
  },

  createUserPaymentMethod: async (body: {
    type: IUserPaymentMethod['type'];
    provider: string;
    providerToken?: string;
    maskedNumber?: string;
    holderName?: string;
    isDefault?: boolean;
    isActive?: boolean;
  }) => {
    const response = await apiRequest('/user-payment-methods', {
      method: 'POST',
      body,
    });
    return response;
  },

  updateUserPaymentMethod: async (id: string, body: Partial<IUserPaymentMethod>) => {
    const response = await apiRequest(`/user-payment-methods/${id}`, {
      method: 'PATCH',
      body,
    });
    return response;
  },

  deleteUserPaymentMethod: async (id: string) => {
    const response = await apiRequest(`/user-payment-methods/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};
