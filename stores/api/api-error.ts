import { AxiosError } from 'axios';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'SESSION_EXPIRED'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BUSINESS_RULE'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

type ApiErrorPayload = {
  status?: number;
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errorCode: ApiErrorCode;
  readonly fieldErrors?: Record<string, string[]>;
  readonly requestId?: string;

  constructor(payload: ApiErrorPayload) {
    const message = payload.message ?? 'Request failed';
    super(message);
    this.name = 'ApiError';
    this.status = payload.status ?? 0;
    this.code = payload.code ?? 'UNKNOWN';
    this.fieldErrors = payload.fieldErrors;
    this.requestId = payload.requestId;
    this.errorCode = mapStatusToErrorCode(this.status, this.code);
  }

  get isConflict() {
    return this.status === 409 || this.code === 'BOOKING_SLOT_CONFLICT';
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

function mapStatusToErrorCode(status: number, code?: string): ApiErrorCode {
  if (status === 400) return 'VALIDATION_ERROR';
  if (status === 401) return 'SESSION_EXPIRED';
  if (status === 403) return 'PERMISSION_DENIED';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 422) return 'BUSINESS_RULE';
  if (status >= 500) return 'SERVER_ERROR';
  if (code === 'BOOKING_SLOT_CONFLICT') return 'CONFLICT';
  return 'UNKNOWN';
}

type ErrorBody = {
  message?: string | string[];
  code?: string;
  fieldErrors?: Record<string, string[]>;
  errors?: Record<string, string[]>;
  requestId?: string;
};

export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const body = (error.response?.data ?? {}) as ErrorBody;
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message || error.message || 'Request failed';

    return new ApiError({
      status,
      code: body.code,
      message,
      fieldErrors: body.fieldErrors ?? body.errors,
      requestId: body.requestId,
    });
  }

  if (error instanceof Error) {
    return new ApiError({ message: error.message });
  }

  return new ApiError({ message: 'Request failed' });
}

export function getApiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  return parseApiError(error).message || fallback;
}
