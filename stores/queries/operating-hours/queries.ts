'use client';

import { useQuery } from '@tanstack/react-query';

import { operatingHoursService } from '@/stores/service/operating-hours.service';

import { operatingHoursKeys } from './keys';

export const useOperatingHours = (venueId: string) =>
  useQuery({
    queryKey: operatingHoursKeys.byVenue(venueId),
    queryFn: async () => {
      const response = await operatingHoursService.getByVenue(venueId);
      return response as any;
    },
    enabled: Boolean(venueId),
  });
