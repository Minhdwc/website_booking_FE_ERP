import { apiRequest } from '@/stores/api/api-request';
import { IPayment, PaymentMethod, PaymentStatus } from '@/stores/api/types';

export interface PaymentResponse {
  status: string;
  message: string;
  data: PaymentPage;
}

export interface PaymentPage {
  page: number;
  limit: number;
  total: number;
  data: IPayment[];
}

export interface PaymentDetailResponse {
  status: string;
  message: string;
  data: IPayment;
}

export interface PaymentsResponse {
  status: string;
  message: string;
  data: IPayment[];
}

export const paymentService = {
  getPayments: async () => {
    const response = await apiRequest('/payments', { method: 'GET' });
    return response;
  },

  getPayment: async (id: string) => {
    const response = await apiRequest(`/payments/${id}`, { method: 'GET' });
    return response;
  },

  createPayment: async (body: {
    bookingId: string;
    method?: PaymentMethod;
    status?: PaymentStatus;
  }) => {
    const response = await apiRequest('/payments', { method: 'POST', body });
    return response;
  },

  updatePayment: async (id: string, body: { value: IPayment }) => {
    const response = await apiRequest(`/payments/${id}`, {
      method: 'PUT',
      body: { value: body.value },
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
