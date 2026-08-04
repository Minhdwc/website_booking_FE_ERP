export const vietqrKeys = {
  all: ['vietqr'] as const,
  banks: () => [...vietqrKeys.all, 'banks'] as const,
};
