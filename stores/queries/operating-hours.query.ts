'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { IOperatingHour } from '@/stores/api/types';
import { operatingHoursService } from '@/stores/service/operating-hours.service';

export const operatingHoursKeys = {
  all: ['operating-hours'] as const,
  byVenue: (venueId: string) => [...operatingHoursKeys.all, venueId] as const,
};

export const useOperatingHours = (venueId: string) =>
  useQuery({
    queryKey: operatingHoursKeys.byVenue(venueId),
    queryFn: async () => {
      const response = await operatingHoursService.getByVenue(venueId);
      return response as any;
    },
    enabled: Boolean(venueId),
  });

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
