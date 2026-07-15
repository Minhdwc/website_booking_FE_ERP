import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { IUser } from '@/stores/api/types';

export interface UserResponse {
  status: string;
  message: string;
  data: Response<IUser>;
}

export interface UserDetailResponse {
  status: string;
  message: string;
  data: IUser;
}

export const userService = {
  getUsers: async (params?: { search?: string; page?: string; limit?: string }) => {
    const response = await apiRequest('/users', { method: 'GET', params });
    return response;
  },

  getUserById: async (id: string) => {
    const response = await apiRequest(`/users/${id}`, {
      method: 'GET',
    });
    return response;
  },

  createUser: async (body: {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
    isActive?: boolean;
  }) => {
    const response = await apiRequest('/users', {
      method: 'POST',
      body,
    });
    return response;
  },

  updateUser: async (id: string, body: { value: IUser }) => {
    const response = await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body,
    });
    return response;
  },

  deleteUser: async (id: string) => {
    const response = await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};
