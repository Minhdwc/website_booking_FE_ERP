import { apiRequest } from '@/stores/api/api-request';
import { IPayment, PaymentMethod, PaymentStatus } from '@/stores/api/types';

export interface PaymentResponse {
  status: number;
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
  status: number;
  message: string;
  data: IPayment;
}

export interface PaymentsResponse {
  status: number;
  message: string;
  data: IPayment[];
}

export interface VnpayUrlResponse {
  status: number;
  message: string;
  data: { paymentUrl: string };
}

export const paymentService = {
  getPayments: (params?: any) =>
    apiRequest<PaymentsResponse>('/payments', { method: 'GET', params }),

  getPayment: (id: string) =>
    apiRequest<PaymentDetailResponse>(`/payments/${id}`, { method: 'GET' }),

  createPayment: (body: { bookingId: string; method?: PaymentMethod; status?: PaymentStatus }) =>
    apiRequest<PaymentDetailResponse>('/payments', { method: 'POST', body }),

  updatePayment: (id: string, body: Partial<IPayment>) =>
    apiRequest<PaymentDetailResponse>(`/payments/${id}`, {
      method: 'PATCH',
      body,
    }),

  deletePayment: (id: string) => apiRequest(`/payments/${id}`, { method: 'DELETE' }),

  createVnpayUrl: (paymentId: string) =>
    apiRequest<VnpayUrlResponse>(`/payments/${paymentId}/vnpay-url`, {
      method: 'POST',
    }),
};
