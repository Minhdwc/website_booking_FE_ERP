'use client';

import { useQuery } from '@tanstack/react-query';

import { vietqrService } from '@/stores/service/vietqr.service';

export const vietqrKeys = {
  all: ['vietqr'] as const,
  banks: () => [...vietqrKeys.all, 'banks'] as const,
};

export const useVietQrBanks = () =>
  useQuery({
    queryKey: vietqrKeys.banks(),
    queryFn: () => vietqrService.getBanks(),
    staleTime: 1000 * 60 * 60 * 24,
  });
