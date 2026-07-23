'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, PencilIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useBooking, useUpdateBooking } from '@/stores/queries/booking.query';

const formSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled']),
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

export const DialogEditBooking = ({ bookingId }: { bookingId: string }) => {
  const [open, setOpen] = useState(false);
  const { data: booking, isLoading, isError, error } = useBooking(bookingId);
  const updateBookingMutation = useUpdateBooking();
  const isSaving = updateBookingMutation.isPending;
  const primaryItem = booking?.items?.[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: 'confirmed' },
    values:
      booking && ['confirmed', 'completed', 'cancelled'].includes(booking.status)
        ? { status: booking.status as FormValues['status'] }
        : undefined,
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset();
  };

  const handleSubmit = async (values: FormValues) => {
    if (!booking) return;

    try {
      await updateBookingMutation.mutateAsync({
        id: booking.id,
        body: { status: values.status },
      });
      toast.success('Cập nhật đặt sân thành công');
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không cập nhật được đặt sân.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 font-normal" />
        }
      >
        <PencilIcon className="size-3.5 text-muted-foreground" />
        Chỉnh sửa
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật đặt sân</DialogTitle>
          <DialogDescription>Đổi trạng thái booking. Thông tin sân/ngày chỉ xem.</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-3 py-2">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        )}

        {isError && (
          <p className="py-6 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : 'Không tải được đặt sân'}
          </p>
        )}

        {booking && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm">
                <p className="font-medium text-foreground">
                  {primaryItem?.field?.name || 'Sân'} · {primaryItem?.date || '—'}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {booking.user?.name || booking.userId}
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
                        {statusOptions.map((option) => (
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Huỷ
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2Icon className="size-3.5 animate-spin" />}
                  {isSaving ? 'Đang lưu…' : 'Lưu thay đổi'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
