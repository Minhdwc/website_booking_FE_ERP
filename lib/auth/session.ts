export interface SessionUser {
  id: string;
  email: string;
  name: string;
  username: string;
  phone: string | null;
  role: string;
  venueId: string | null;
  isActive: boolean;
  permissions?: string[];
}

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const LEGACY_TOKEN_KEYS = ['access_token', 'refresh_token'] as const;

const LEGACY_STORAGE_KEYS = [
  'access_token',
  'refresh_token',
  'sportbooking-theme',
  'auth_user',
  'crp:venues:onboarding:done',
  'erp:venues-onboarding-done',
] as const;

const ALLOWED_STORAGE_KEYS = [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, 'theme'] as const;

function clearLegacyTokenKeys() {
  for (const key of LEGACY_TOKEN_KEYS) {
    localStorage.removeItem(key);
  }
}

function migrateLegacyTokens() {
  const legacyAccess = localStorage.getItem('access_token');
  const legacyRefresh = localStorage.getItem('refresh_token');

  if (legacyAccess && !localStorage.getItem(ACCESS_TOKEN_KEY)) {
    localStorage.setItem(ACCESS_TOKEN_KEY, legacyAccess);
  }
  if (legacyRefresh && !localStorage.getItem(REFRESH_TOKEN_KEY)) {
    localStorage.setItem(REFRESH_TOKEN_KEY, legacyRefresh);
  }

  clearLegacyTokenKeys();
}

function pruneLocalStorage() {
  const allowed = new Set<string>(ALLOWED_STORAGE_KEYS);

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && !allowed.has(key)) {
      localStorage.removeItem(key);
    }
  }
}

function initStorage() {
  migrateLegacyTokens();

  for (const key of LEGACY_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }

  pruneLocalStorage();
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  clearLegacyTokenKeys();
  pruneLocalStorage();
}

export function clearSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  clearLegacyTokenKeys();
  pruneLocalStorage();
}

if (typeof window !== 'undefined') {
  initStorage();
}
