import { apiRequest } from '@/stores/api/api-request';
import { IPriceRule } from '@/stores/api/types';

export type PriceRulesResponse = {
  statusCode: number;
  message: string;
  data: IPriceRule[];
};

export type PriceRuleResponse = {
  statusCode: number;
  message: string;
  data: IPriceRule;
};

export const priceRuleService = {
  getByCourt: (courtId: string) =>
    apiRequest(`/courts/${courtId}/price-rules`, { method: 'GET' }),

  create: (
    courtId: string,
    body: {
      dayOfWeek: number[];
      timeFrom: string;
      timeTo: string;
      isPeak?: boolean;
      priceVnd: number;
    },
  ) =>
    apiRequest(`/courts/${courtId}/price-rules`, {
      method: 'POST',
      body,
    }),

  update: (
    id: string,
    body: Partial<{
      dayOfWeek: number[];
      timeFrom: string;
      timeTo: string;
      isPeak: boolean;
      priceVnd: number;
    }>,
  ) =>
    apiRequest(`/price-rules/${id}`, {
      method: 'PATCH',
      body,
    }),

  remove: (id: string) =>
    apiRequest(`/price-rules/${id}`, { method: 'DELETE' }),
};
