'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { priceRuleService } from '@/stores/service/price-rule.service';

import { priceRuleKeys } from './keys';

export const useCreatePriceRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courtId,
      body,
    }: {
      courtId: string;
      body: Parameters<typeof priceRuleService.create>[1];
    }) => priceRuleService.create(courtId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: priceRuleKeys.byCourt(variables.courtId) });
    },
  });
};

export const useUpdatePriceRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; courtId: string; body: any }) =>
      priceRuleService.update(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: priceRuleKeys.byCourt(variables.courtId) });
    },
  });
};

export const useDeletePriceRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; courtId: string }) => priceRuleService.remove(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: priceRuleKeys.byCourt(variables.courtId) });
    },
  });
};
