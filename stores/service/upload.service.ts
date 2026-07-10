import { apiRequest } from '@/stores/api/api-request';

export interface UploadResponse {
  statusCode: number;
  message: string;
  data: {
    key: string;
    url: string;
  };
}

export interface PresignUploadResponse {
  statusCode: number;
  message: string;
  data: {
    key: string;
    uploadUrl: string;
    url: string;
  };
}

export const uploadService = {
  upload: async (file: File, folder: 'avatars' | 'venues' | 'fields' = 'avatars') => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiRequest(`/uploads?folder=${folder}`, {
      method: 'POST',
      formData,
    });
    return response as UploadResponse;
  },

  presign: async (body: {
    folder: 'avatars' | 'venues' | 'fields';
    filename: string;
    contentType: string;
  }) => {
    const response = await apiRequest('/uploads/presign', {
      method: 'POST',
      body,
    });
    return response as PresignUploadResponse;
  },
};
