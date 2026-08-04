'use client';

import { Loader2Icon } from 'lucide-react';

import { BookingGate } from '@/components/auth/permission-gates';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { IAvailabilitySlot, IBooking } from '@/stores/api/types';
import { useCourtAvailability } from '@/stores/queries/court';

type DaySlotGridProps = {
  courtId: string;
  courtName: string;
  date: string;
  bookings: IBooking[];
  onWalkIn: (prefill: {
    courtId: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
  onBookingDetail: (bookingId: string) => void;
};

function formatSlotTime(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

function findBookingForSlot(
  bookings: IBooking[],
  courtId: string,
  date: string,
  slot: IAvailabilitySlot,
) {
  const slotStart = formatSlotTime(slot.startTime);
  const slotEnd = formatSlotTime(slot.endTime);

  return bookings.find((booking) =>
    booking.items?.some((item) => {
      if (item.courtId !== courtId) return false;
      const itemDate = item.date.slice(0, 10);
      if (itemDate !== date) return false;
      return (
        formatSlotTime(item.startTime) === slotStart && formatSlotTime(item.endTime) === slotEnd
      );
    }),
  );
}

export function DaySlotGrid({
  courtId,
  courtName,
  date,
  bookings,
  onWalkIn,
  onBookingDetail,
}: DaySlotGridProps) {
  const { data, isLoading, isError } = useCourtAvailability(courtId, date);
  const slots = data?.slots ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Đang tải khung giờ…
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-destructive">Không tải được khung giờ sân.</p>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sân chưa mở cửa hoặc không có khung giờ cho ngày này.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-heading">{courtName}</p>
        <Badge variant="secondary" className="tabular-nums">
          {slots.filter((slot) => slot.status === 'available').length} trống
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {slots.map((slot) => {
          const slotKey = `${slot.startTime}|${slot.endTime}`;
          const label = `${formatSlotTime(slot.startTime)} – ${formatSlotTime(slot.endTime)}`;
          const isAvailable = slot.status === 'available';
          const isBooked = slot.status === 'booked';
          const isPast = slot.status === 'past';
          const matchedBooking = isBooked
            ? findBookingForSlot(bookings, courtId, date, slot)
            : undefined;

          const handleClick = () => {
            if (isAvailable) {
              onWalkIn({
                courtId,
                date,
                startTime: formatSlotTime(slot.startTime),
                endTime: formatSlotTime(slot.endTime),
              });
              return;
            }
            if (isBooked && matchedBooking) {
              onBookingDetail(matchedBooking.id);
            }
          };

          const button = (
            <button
              type="button"
              disabled={isPast || (isBooked && !matchedBooking)}
              onClick={handleClick}
              className={cn(
                'w-full rounded-lg border px-2 py-3 text-left text-xs transition-colors',
                isAvailable &&
                  'cursor-pointer border-brand-200 bg-brand-50/60 hover:border-brand-400 hover:bg-brand-50',
                isBooked &&
                  matchedBooking &&
                  'cursor-pointer border-amber-200 bg-amber-50/80 hover:border-amber-400',
                isBooked &&
                  !matchedBooking &&
                  'cursor-not-allowed border-border/60 bg-muted/40 opacity-70',
                isPast && 'cursor-not-allowed border-border/40 bg-muted/20 opacity-50',
              )}
            >
              <p className="font-semibold tabular-nums text-heading">{label}</p>
              {isAvailable ? (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {formatCurrency(slot.subtotal)}
                </p>
              ) : null}
              {isBooked ? (
                <p className="mt-1 text-[10px] font-medium text-amber-700">Đã đặt</p>
              ) : null}
              {isPast ? <p className="mt-1 text-[10px] text-muted-foreground">Đã qua</p> : null}
            </button>
          );

          if (isAvailable) {
            return <BookingGate.Create key={slotKey}>{button}</BookingGate.Create>;
          }

          return <div key={slotKey}>{button}</div>;
        })}
      </div>
    </div>
  );
}
