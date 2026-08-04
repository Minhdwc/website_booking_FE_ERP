export const priceRuleKeys = {
  all: ['price-rules'] as const,
  byCourt: (courtId: string) => [...priceRuleKeys.all, courtId] as const,
};
