export interface SessionUser {
  id: string;
  email: string;
  name: string;
  username: string;
  phone: string | null;
  role: string;
  venueId: string | null;
  isActive: boolean;
}

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string) {
  accessToken = token;
}

export function clearSession() {
  accessToken = null;
}
