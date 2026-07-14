'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { queryDefaultOptions } from '@/lib/query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: queryDefaultOptions,
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
