'use client';

import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/provider/query-provider';
import { SessionProvider } from '@/provider/session-provider';
import { SocketRealtimeProvider } from '@/provider/socket-realtime-provider';
import { ThemeProvider } from '@/provider/theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SessionProvider>
          <SocketRealtimeProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </SocketRealtimeProvider>
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
