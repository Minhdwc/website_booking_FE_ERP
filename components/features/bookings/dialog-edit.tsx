'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, PencilIcon } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermission } from '@/hooks/use-permission';
import { showApiErrorToast } from '@/lib/api/handle-api-error';
import { useBooking, useUpdateBooking } from '@/stores/queries/booking';

const formSchema = z
  .object({
    status: z.enum(['confirmed', 'completed', 'cancelled']),
    reason: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.status === 'confirmed' && !values.reason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cần ghi lý do khi xác nhận thủ công',
        path: ['reason'],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const statusOptions: { value: FormValues['status']; label: string }[] = [
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã huỷ' },
];

function formatSlotTime(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

function BookingEditForm({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const { data: booking, isLoading, isError, error } = useBooking(bookingId);
  const updateBookingMutation = useUpdateBooking();
  const canCancel = usePermission('bookings:cancel');
  const isSaving = updateBookingMutation.isPending;
  const primaryItem = booking?.items?.[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: 'confirmed', reason: '' },
    values:
      booking && ['confirmed', 'completed', 'cancelled'].includes(booking.status)
        ? { status: booking.status as FormValues['status'], reason: '' }
        : undefined,
  });

  const availableStatusOptions = canCancel
    ? statusOptions
    : statusOptions.filter((option) => option.value !== 'cancelled');

  const selectedStatus = useWatch({ control: form.control, name: 'status' });

  const handleSubmit = async (values: FormValues) => {
    if (!booking) return;

    const payload = {
      status: values.status,
      ...(values.status === 'confirmed' && values.reason?.trim()
        ? { reason: values.reason.trim() }
        : {}),
    };
    try {
      await updateBookingMutation.mutateAsync({ id: booking.id, body: payload });
      toast.success('Cập nhật đặt sân thành công');
      onClose();
    } catch (err) {
      showApiErrorToast(err, 'Không cập nhật được đặt sân');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-6 text-center text-sm text-destructive">
        {error instanceof Error ? error.message : 'Không tải được đặt sân'}
      </p>
    );
  }

  if (!booking) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm">
          <p className="font-medium text-foreground">
            {primaryItem?.court?.name || 'Sân'} · {primaryItem?.date || '—'}
          </p>
          <p className="mt-1 text-muted-foreground">
            {booking.customerName || booking.user?.name || booking.userId}
            {booking.customerPhone || booking.user?.phone
              ? ` · ${booking.customerPhone || booking.user?.phone}`
              : ''}
            {primaryItem
              ? ` · ${formatSlotTime(primaryItem.startTime)} – ${formatSlotTime(primaryItem.endTime)}`
              : ''}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{booking.bookingCode}</p>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Trạng thái <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedStatus === 'confirmed' && (
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Lý do xác nhận <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="VD: Khách chuyển khoản ngoài hệ thống" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2Icon className="size-3.5 animate-spin" />}
            {isSaving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

/** Dialog controlled — dùng từ calendar hoặc nơi parent giữ state. */
export function BookingEditDialog({
  bookingId,
  open,
  onOpenChange,
}: {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật đặt sân</DialogTitle>
          <DialogDescription>Đổi trạng thái booking. Thông tin sân/ngày chỉ xem.</DialogDescription>
        </DialogHeader>
        <BookingEditForm bookingId={bookingId} onClose={close} />
      </DialogContent>
    </Dialog>
  );
}

/** Dialog + trigger — dùng trong menu/popover của trang bookings. */
export const DialogEditBooking = ({
  bookingId,
  triggerLabel = 'Chỉnh sửa',
  triggerClassName,
}: {
  bookingId: string;
  triggerLabel?: string;
  triggerClassName?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={triggerClassName ?? 'w-full justify-start gap-2 font-normal'}
          />
        }
      >
        <PencilIcon className="size-3.5 text-muted-foreground" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật đặt sân</DialogTitle>
          <DialogDescription>Đổi trạng thái booking. Thông tin sân/ngày chỉ xem.</DialogDescription>
        </DialogHeader>
        <BookingEditForm bookingId={bookingId} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
