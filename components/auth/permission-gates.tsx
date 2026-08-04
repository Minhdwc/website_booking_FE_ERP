'use client';

import type { ReactNode } from 'react';

import { PermissionGate } from '@/components/auth/permission-gate';
import type { Permission } from '@/lib/auth/permissions';

type GateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

function gate(permission: Permission) {
  return function Gate({ children, fallback }: GateProps) {
    return (
      <PermissionGate permission={permission} fallback={fallback}>
        {children}
      </PermissionGate>
    );
  };
}

/** Component bọc quyền — Bookings */
export const BookingGate = {
  View: gate('bookings:view'),
  Create: gate('bookings:create'),
  Edit: gate('bookings:edit'),
  Delete: gate('bookings:delete'),
  ConfirmPayment: gate('bookings:confirm_payment'),
  Cancel: gate('bookings:cancel'),
};

export const VenueGate = {
  View: gate('venues:view'),
  Create: gate('venues:create'),
  Edit: gate('venues:edit'),
  Delete: gate('venues:delete'),
};

export const CourtGate = {
  View: gate('courts:view'),
  Create: gate('courts:create'),
  Edit: gate('courts:edit'),
  Delete: gate('courts:delete'),
};

/** Component bọc quyền — Users */
export const UserGate = {
  View: gate('users:view'),
  Create: gate('users:create'),
  Edit: gate('users:edit'),
  Delete: gate('users:delete'),
};

/** Component bọc quyền — Reviews */
export const ReviewGate = {
  View: gate('reviews:view'),
  Delete: gate('reviews:delete'),
};

export const PaymentGate = {
  View: gate('payments:view'),
  Confirm: gate('payments:confirm'),
};

export const ChatGate = {
  View: gate('chat:view'),
};
