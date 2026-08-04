'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IOperatingHour } from '@/stores/api/types';
import { operatingHoursService } from '@/stores/service/operating-hours.service';

import { operatingHoursKeys } from './keys';

export const useReplaceOperatingHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ venueId, hours }: { venueId: string; hours: IOperatingHour[] }) =>
      operatingHoursService.replaceAll(venueId, hours),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: operatingHoursKeys.byVenue(variables.venueId),
      });
    },
  });
};
