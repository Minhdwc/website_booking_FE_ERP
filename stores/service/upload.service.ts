import { apiRequest } from '@/stores/api/api-request';
import { UploadFolder } from '@/stores/api/types';

export interface UploadResponse {
  status: string;
  message: string;
  data: {
    key: string;
    url: string;
  };
}

export interface PresignUploadResponse {
  status: string;
  message: string;
  data: {
    key: string;
    uploadUrl: string;
    url: string;
  };
}

export const uploadService = {
  upload: async (file: File, folder: UploadFolder = 'avatars') => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiRequest(`/uploads?folder=${folder}`, {
      method: 'POST',
      formData,
    });
    return response;
  },

  presign: async (body: {
    folder: UploadFolder;
    filename: string;
    contentType: string;
  }) => {
    const response = await apiRequest('/uploads/presign', {
      method: 'POST',
      body,
    });
    return response;
  },
};
