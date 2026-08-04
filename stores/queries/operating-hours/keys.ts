export const operatingHoursKeys = {
  all: ['operating-hours'] as const,
  byVenue: (venueId: string) => [...operatingHoursKeys.all, venueId] as const,
};
