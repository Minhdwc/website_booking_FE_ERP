'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/auth/session';
import { useSession } from '@/provider/session-provider';
import { bookingKeys } from '@/stores/queries/booking.query';
import { notificationKeys } from '@/stores/queries/notification.query';

function getSocketUrl() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  return apiBase.replace(/\/api\/v1\/?$/, '');
}

export function SocketRealtimeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useSession();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.info('[socket] connected', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.warn('[socket] connect_error', error.message);
    });

    socket.on(
      'notification',
      (payload: { title?: string; message?: string; type?: string }) => {
        const title = payload.title?.trim() || 'Thông báo mới';
        const message = payload.message?.trim();

        if (message) {
          toast.info(title, { description: message });
        } else {
          toast.info(title);
        }

        void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      },
    );

    socket.on('booking:updated', () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    });

    socket.on('booking-status', () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, isLoading, queryClient]);

  return children;
}
