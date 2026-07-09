import { apiRequest } from '@/stores/api/api-request';

export interface AuthLoginResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    user?: unknown;
  };
}

export interface AuthRefreshResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
  };
}

export const authService = {
  login: async (body: { email: string; password: string }) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body,
    });
    return response;
  },

  logout: async () => {
    const response = await apiRequest('/auth/logout', {
      method: 'POST',
    });
    return response;
  },

  refresh: async () => {
    const response = await apiRequest('/auth/refresh', {
      method: 'POST',
    });
    return response;
  },

  register: async (body: {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body,
    });
    return response;
  },
};
