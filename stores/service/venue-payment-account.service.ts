import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { IVenuePaymentAccount } from '@/stores/api/types';

export interface VenuePaymentAccountDetailResponse {
  status: string;
  message: string;
  data: IVenuePaymentAccount;
}

export interface VenuePaymentAccountsResponse {
  status: string;
  message: string;
  data: Response<IVenuePaymentAccount>;
}

export const venuePaymentAccountService = {
  getVenuePaymentAccounts: async (params?: { venueId?: string; page?: string; limit?: string }) => {
    const response = await apiRequest('/venue-payment-accounts', {
      method: 'GET',
      params,
    });
    return response;
  },

  getVenuePaymentAccount: async (id: string) => {
    const response = await apiRequest(`/venue-payment-accounts/${id}`, {
      method: 'GET',
    });
    return response;
  },

  createVenuePaymentAccount: async (body: {
    venueId: string;
    paymentMethodId: string;
    provider?: string;
    accountNumber?: string;
    accountName?: string;
    bankCode?: string;
    bankName?: string;
    qrCodeUrl?: string;
    isActive?: boolean;
  }) => {
    const response = await apiRequest('/venue-payment-accounts', {
      method: 'POST',
      body,
    });
    return response;
  },

  updateVenuePaymentAccount: async (id: string, body: Partial<IVenuePaymentAccount>) => {
    const response = await apiRequest(`/venue-payment-accounts/${id}`, {
      method: 'PATCH',
      body,
    });
    return response;
  },

  uploadQrCode: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiRequest(`/venue-payment-accounts/${id}/qr-code`, {
      method: 'POST',
      formData,
    });
    return response;
  },

  deleteVenuePaymentAccount: async (id: string) => {
    const response = await apiRequest(`/venue-payment-accounts/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};
