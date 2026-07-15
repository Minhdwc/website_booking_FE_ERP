'use client';

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setTokens,
  SessionUser,
} from '@/lib/auth/session';
import { accountService, AccountMeResponse } from '@/stores/service/account.service';
import { authService, AuthLoginResponse, AuthRefreshResponse } from '@/stores/service/auth.service';
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

const ERP_ROLES = ['admin', 'staff'];

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await authService.logout();
    clearSession();
    setUser(null);
    router.replace('/login');
  }, [router]);

  useEffect(() => {
    const init = async () => {
      try {
        let accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        if (!accessToken && refreshToken) {
          const refreshed = (await authService.refresh(refreshToken)) as AuthRefreshResponse;
          if (!refreshed?.data?.accessToken || !refreshed?.data?.refreshToken) {
            throw new Error('Refresh thất bại');
          }
          setTokens(refreshed.data.accessToken, refreshed.data.refreshToken);
          accessToken = refreshed.data.accessToken;
        }

        if (!accessToken) {
          setUser(null);
          return;
        }

        const me = (await accountService.me()) as AccountMeResponse;
        if (!me?.data?.id || !ERP_ROLES.includes(me.data.role)) {
          clearSession();
          setUser(null);
          return;
        }

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
    const { accessToken, refreshToken } = response?.data ?? {};
    if (!accessToken || !refreshToken) {
      throw new Error('Đăng nhập thất bại');
    }

    setTokens(accessToken, refreshToken);

    const me = (await accountService.me()) as AccountMeResponse;
    if (!me?.data?.id) {
      clearSession();
      throw new Error('Không lấy được thông tin tài khoản');
    }

    if (!ERP_ROLES.includes(me.data.role)) {
      clearSession();
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
