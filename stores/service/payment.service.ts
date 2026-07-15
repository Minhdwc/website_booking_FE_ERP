import { apiRequest } from '@/stores/api/api-request';
import { Response } from '@/stores/api/response';
import { IPayment } from '@/stores/api/types';

export interface PaymentDetailResponse {
  status: string;
  message: string;
  data: IPayment;
}

export interface PaymentsResponse {
  status: string;
  message: string;
  data: Response<IPayment>;
}

export interface VnpayUrlResponse {
  status: string;
  message: string;
  data: { paymentUrl: string };
}

export const paymentService = {
  getPayments: async (params?: { search?: string; page?: string; limit?: string }) => {
    const response = await apiRequest('/payments', { method: 'GET', params });
    return response;
  },

  getPayment: async (id: string) => {
    const response = await apiRequest(`/payments/${id}`, { method: 'GET' });
    return response;
  },

  createPayment: async (body: {
    bookingId: string;
    method?: IPayment['method'];
    status?: IPayment['status'];
    venuePaymentAccountId?: string;
  }) => {
    const response = await apiRequest('/payments', {
      method: 'POST',
      body,
    });
    return response;
  },

  updatePayment: async (
    id: string,
    body: Partial<
      Pick<
        IPayment,
        'bookingId' | 'method' | 'status' | 'venuePaymentAccountId' | 'transactionCode'
      >
    >,
  ) => {
    const response = await apiRequest(`/payments/${id}`, {
      method: 'PATCH',
      body,
    });
    return response;
  },

  deletePayment: async (id: string) => {
    const response = await apiRequest(`/payments/${id}`, { method: 'DELETE' });
    return response;
  },

  createVnpayUrl: async (paymentId: string) => {
    const response = await apiRequest(`/payments/${paymentId}/vnpay-url`, {
      method: 'POST',
    });
    return response;
  },
};
