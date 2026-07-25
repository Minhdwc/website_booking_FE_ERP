'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { priceRuleService } from '@/stores/service/price-rule.service';

export const priceRuleKeys = {
  all: ['price-rules'] as const,
  byCourt: (courtId: string) => [...priceRuleKeys.all, courtId] as const,
};

export const usePriceRules = (courtId: string) =>
  useQuery({
    queryKey: priceRuleKeys.byCourt(courtId),
    queryFn: async () => {
      const response = await priceRuleService.getByCourt(courtId);
      return response as any;
    },
    enabled: Boolean(courtId),
  });

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
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      courtId: string;
      body: any;
    }) => priceRuleService.update(id, body),
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
