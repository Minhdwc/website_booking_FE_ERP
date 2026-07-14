import type { DefaultOptions } from '@tanstack/react-query';

export const queryDefaultOptions: DefaultOptions = {
  queries: {
    retry: 2,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: 1,
  },
};
