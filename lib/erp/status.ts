import { BookingStatus, FieldStatus, PaymentStatus } from '@/lib/api/types';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger';

export function fieldStatusTone(status: FieldStatus): StatusTone {
  const tones: Record<FieldStatus, StatusTone> = {
    active: 'success',
    inactive: 'neutral',
    maintenance: 'warning',
  };

  return tones[status];
}

export function bookingStatusTone(status: BookingStatus): StatusTone {
  const tones: Record<BookingStatus, StatusTone> = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger',
  };

  return tones[status];
}

export function paymentStatusTone(status: PaymentStatus): StatusTone {
  const tones: Record<PaymentStatus, StatusTone> = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger',
  };

  return tones[status];
}
