import { toast } from 'sonner';

import { ApiError, getApiErrorMessage, parseApiError } from '@/stores/api/api-error';

const ERROR_TOAST_BY_CODE: Partial<Record<ApiError['errorCode'], string>> = {
  PERMISSION_DENIED: 'Bạn không có quyền thực hiện thao tác này',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  CONFLICT: 'Dữ liệu xung đột — vui lòng thử lại',
  SERVER_ERROR: 'Lỗi máy chủ — vui lòng thử lại sau',
};

export function showApiErrorToast(error: unknown, fallback?: string) {
  const apiError = parseApiError(error);
  const message =
    ERROR_TOAST_BY_CODE[apiError.errorCode] ??
    getApiErrorMessage(error, fallback ?? 'Không thực hiện được thao tác');
  toast.error(message);
  return apiError;
}

export { ApiError, parseApiError, getApiErrorMessage };
