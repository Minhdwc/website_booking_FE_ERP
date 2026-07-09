import { SessionUser } from '@/lib/auth/session';
import { apiRequest } from '@/stores/api/api-request';

export interface AccountMeResponse {
  statusCode: number;
  message: string;
  data: SessionUser;
}

export const accountService = {
  me: async () => {
    const response = await apiRequest('/account/me', {
      method: 'GET',
    });
    return response;
  },

  updateProfile: async (body: { name?: string; username?: string; phone?: string }) => {
    const response = await apiRequest('/account/profile', {
      method: 'PATCH',
      body,
    });
    return response;
  },

  changePassword: async (body: { currentPassword: string; newPassword: string }) => {
    const response = await apiRequest('/account/change-password', {
      method: 'PATCH',
      body,
    });
    return response;
  },
};
