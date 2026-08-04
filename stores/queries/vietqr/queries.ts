'use client';

import { useQuery } from '@tanstack/react-query';

import { vietqrService } from '@/stores/service/vietqr.service';

import { vietqrKeys } from './keys';

export const useVietQrBanks = () =>
  useQuery({
    queryKey: vietqrKeys.banks(),
    queryFn: () => vietqrService.getBanks(),
    staleTime: 1000 * 60 * 60 * 24,
  });
