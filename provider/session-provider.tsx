'use client';

import { clearSession, getAccessToken, setAccessToken, type SessionUser } from '@/lib/auth/session';
import { accountService, type AccountMeResponse } from '@/stores/service/account.service';
import {
  authService,
  type AuthLoginResponse,
  type AuthRefreshResponse,
} from '@/stores/service/auth.service';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type SessionContextValue = {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: SessionUser) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Cookie có thể đã hết hạn — vẫn xóa session phía client.
    } finally {
      clearSession();
      setUser(null);
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    const init = async () => {
      try {
        if (!getAccessToken()) {
          try {
            const refreshed = (await authService.refresh()) as AuthRefreshResponse;
            setAccessToken(refreshed.data.accessToken);
          } catch {
            setUser(null);
            return;
          }
        }

        const me = (await accountService.me()) as AccountMeResponse;
        setUser(me.data);
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = (await authService.login({ email, password })) as AuthLoginResponse;
    setAccessToken(response.data.accessToken);

    const me = (await accountService.me()) as AccountMeResponse;

    if (!['admin', 'staff', 'super_staff'].includes(me.data.role)) {
      clearSession();
      try {
        await authService.logout();
      } catch {
        // Bỏ qua nếu cookie đã bị xóa.
      }
      throw new Error('Tài khoản không có quyền truy cập hệ thống ERP');
    }

    setUser(me.data);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      setUser,
    }),
    [user, isLoading, login, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession phải được dùng trong SessionProvider');
  }
  return context;
}
