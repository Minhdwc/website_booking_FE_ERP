import { apiRequest } from '@/stores/api/api-request';
import { IOperatingHour } from '@/stores/api/types';

export type OperatingHoursResponse = {
  statusCode: number;
  message: string;
  data: IOperatingHour[];
};

export const operatingHoursService = {
  getByVenue: (venueId: string) =>
    apiRequest(`/venues/${venueId}/operating-hours`, { method: 'GET' }),

  replaceAll: (venueId: string, hours: IOperatingHour[]) =>
    apiRequest(`/venues/${venueId}/operating-hours`, {
      method: 'PUT',
      body: hours,
    }),
};
