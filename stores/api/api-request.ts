import axios, { AxiosError, InternalAxiosRequestConfig, Method } from 'axios';
import { clearSession, getAccessToken, setAccessToken } from '@/lib/auth/session';

const API_PREFIX = '/api/v1';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  withCredentials: true,
});

type ApiRequestParams = {
  method: Method;
  body?: any;
  formData?: FormData;
  params?: any;
  headers?: any;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? '';
    if (
      !url ||
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await api.post<{ data: { accessToken: string } }>(
        `${API_PREFIX}/auth/refresh`,
      );
      const newToken = response.data.data.accessToken;
      setAccessToken(newToken);

      refreshQueue.forEach(({ resolve, reject }) => {
        if (!newToken) {
          reject(error);
          return;
        }
        resolve(newToken);
      });
      refreshQueue = [];

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      refreshQueue.forEach(({ reject }) => {
        reject(refreshError);
      });
      refreshQueue = [];

      clearSession();

      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.replace('/login');
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export async function apiRequest<T>(
  path: string,
  { method, body, formData, params, headers }: ApiRequestParams,
): Promise<T> {
  const res = await api.request<T>({
    url: `${API_PREFIX}${path}`,
    method,
    params,
    headers: {
      ...(formData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    data: formData ?? body,
  });
  return res.data;
}
