import { apiRequest } from '@/stores/api/api-request';
import { IUser } from '../api/types';
export interface AuthLoginResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: IUser;
  };
}

export interface AuthRefreshResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
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

  refresh: async (refreshToken: string) => {
    const response = await apiRequest('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
    return response;
  },

  register: async (body: {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body,
    });
    return response;
  },
};
