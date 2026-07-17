import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { IUser, UserRole } from '@/stores/api/types';

export interface UsersResponse {
  statusCode: number;
  message: string;
  data: Response<IUser> | IUser[];
}

export interface UserDetailResponse {
  statusCode: number;
  message: string;
  data: IUser;
}

export type CreateUserBody = {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole | string;
  isActive?: boolean;
};

export type UpdateUserBody = {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: UserRole | string;
  isActive?: boolean;
};

export const userService = {
  getUsers: (params?: { search?: string; page?: string; limit?: string }) =>
    apiRequest<UsersResponse>('/users', { method: 'GET', params }),

  getUserById: (id: string) => apiRequest<UserDetailResponse>(`/users/${id}`, { method: 'GET' }),

  createUser: (body: CreateUserBody) =>
    apiRequest<UserDetailResponse>('/users', { method: 'POST', body }),

  updateUser: (id: string, body: UpdateUserBody) =>
    apiRequest<UserDetailResponse>(`/users/${id}`, { method: 'PATCH', body }),

  deleteUser: (id: string) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
};
