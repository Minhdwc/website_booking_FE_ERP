'use client';

import { useMemo } from 'react';

import { PageHeader } from '@/components/custom/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useBookings } from '@/stores/queries/booking.query';

type CustomerRow = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bookingCount: number;
  lastBookingAt: string;
};

export function CustomersPage() {
  const { data: bookings = [], isLoading } = useBookings({ limit: '200' });

  const customers = useMemo(() => {
    const map = new Map<string, CustomerRow>();

    bookings.forEach((booking) => {
      const customerKey = booking.customerPhone || booking.user?.id;
      if (!customerKey) return;

      const existing = map.get(customerKey);
      const name = booking.customerName || booking.user?.name || 'Khách';
      const email = booking.user?.email;
      const phone = booking.customerPhone || booking.user?.phone;

      if (!existing) {
        map.set(customerKey, {
          id: customerKey,
          name,
          email,
          phone,
          bookingCount: 1,
          lastBookingAt: booking.createdAt,
        });
        return;
      }

      map.set(customerKey, {
        ...existing,
        name: existing.name || name,
        phone: existing.phone || phone,
        bookingCount: existing.bookingCount + 1,
        lastBookingAt:
          new Date(booking.createdAt) > new Date(existing.lastBookingAt)
            ? booking.createdAt
            : existing.lastBookingAt,
      });
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastBookingAt).getTime() - new Date(a.lastBookingAt).getTime(),
    );
  }, [bookings]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Khách hàng"
        description="Danh sách khách suy ra từ lịch sử booking của owner."
      />

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        {isLoading ? (
          <Skeleton className="m-4 h-32 w-full" />
        ) : customers.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            Chưa có khách hàng từ booking.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Điện thoại</TableHead>
                <TableHead className="text-right">Lượt đặt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email ?? '—'}</TableCell>
                  <TableCell>{customer.phone ?? '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{customer.bookingCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
