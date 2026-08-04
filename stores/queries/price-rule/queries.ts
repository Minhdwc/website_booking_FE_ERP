'use client';

import { useQuery } from '@tanstack/react-query';

import { priceRuleService } from '@/stores/service/price-rule.service';

import { priceRuleKeys } from './keys';

export const usePriceRules = (courtId: string) =>
  useQuery({
    queryKey: priceRuleKeys.byCourt(courtId),
    queryFn: async () => {
      const response = await priceRuleService.getByCourt(courtId);
      return response as any;
    },
    enabled: Boolean(courtId),
  });
