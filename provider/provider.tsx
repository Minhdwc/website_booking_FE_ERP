'use client';

import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/provider/query-provider';
import { SessionProvider } from '@/provider/session-provider';
import { ThemeProvider } from '@/provider/theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SessionProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
