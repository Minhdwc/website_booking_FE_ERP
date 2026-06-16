import { UserRole } from '@/lib/api/types';

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
};

const ACCESS_TOKEN_KEY = 'fieldops.accessToken';
const REFRESH_TOKEN_KEY = 'fieldops.refreshToken';

export function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function saveSession(tokens: { accessToken: string; refreshToken: string }) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
