'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/auth/session';
import { useSession } from '@/provider/session-provider';
import { analyticsKeys } from '@/stores/queries/analytics';
import { bookingKeys } from '@/stores/queries/booking';
import { chatKeys } from '@/stores/queries/chat';
import { courtKeys } from '@/stores/queries/court';
import { notificationKeys } from '@/stores/queries/notification';
import { paymentKeys } from '@/stores/queries/payment';
import { reportKeys } from '@/stores/queries/report';

function getSocketUrl() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  return apiBase.replace(/\/api\/v1\/?$/, '');
}

function invalidateOperationalQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
  void queryClient.invalidateQueries({ queryKey: courtKeys.all });
  void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
  void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  void queryClient.invalidateQueries({ queryKey: chatKeys.all });
  void queryClient.invalidateQueries({ queryKey: reportKeys.all });
  void queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
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

    socket.on('notification', (payload: { title?: string; message?: string; type?: string }) => {
      const title = payload.title?.trim() || 'Thông báo mới';
      const message = payload.message?.trim();

      if (message) {
        toast.info(title, { description: message });
      } else {
        toast.info(title);
      }

      invalidateOperationalQueries(queryClient);
    });

    socket.on('booking:updated', () => {
      invalidateOperationalQueries(queryClient);
      toast.info('Đặt sân đã cập nhật');
    });

    socket.on('booking-status', (payload?: { status?: string }) => {
      invalidateOperationalQueries(queryClient);
      const status = payload?.status;
      toast.info(status ? `Trạng thái booking: ${status}` : 'Trạng thái booking đã thay đổi');
    });

    socket.on('booking.created', () => {
      invalidateOperationalQueries(queryClient);
      toast.info('Có đặt sân mới');
    });

    socket.on('booking.confirmed', () => {
      invalidateOperationalQueries(queryClient);
      toast.success('Đặt sân đã xác nhận');
    });

    socket.on('booking.cancelled', () => {
      invalidateOperationalQueries(queryClient);
      toast.info('Đặt sân đã huỷ');
    });

    socket.on('booking.expired', () => {
      invalidateOperationalQueries(queryClient);
      toast.warning('Đặt sân hết hạn giữ chỗ');
    });

    socket.on('payment.success', () => {
      invalidateOperationalQueries(queryClient);
      toast.success('Thanh toán thành công');
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, isLoading, queryClient]);

  return children;
}
